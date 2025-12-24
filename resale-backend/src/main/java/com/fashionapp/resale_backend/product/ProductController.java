package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.common.ai.VirtualTryOnService;
import com.fashionapp.resale_backend.common.storage.FileUploadResult;
import com.fashionapp.resale_backend.common.storage.GcsService;
import com.fashionapp.resale_backend.product.dto.ProductCreateDto;
import com.fashionapp.resale_backend.product.dto.ProductResponseDto;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final GcsService gcsService;
    private final VirtualTryOnService virtualTryOnService;

    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody ProductCreateDto dto) {
        return ResponseEntity.ok(productService.createProduct(dto));
    }

    @PostMapping("/{productId}/upload-images")
    @Transactional
    public ResponseEntity<ProductResponseDto> uploadProductImages(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files) throws IOException {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        for (MultipartFile file : files) {
            // 1. Upload and receive the FileUploadResult
            FileUploadResult result = gcsService.uploadFile(file, "products");

            ProductImage image = new ProductImage();
            image.setUrl(result.publicUrl()); // Public HTTPS link
            image.setGcsUri(result.gcsUri()); // Internal gs:// link
            image.setProduct(product);

            productImageRepository.save(image);
        }

        // Refresh product to include new images in the response
        return ResponseEntity.ok(productService.mapToResponse(product));
    }

    @PostMapping("/try-on")
    public ResponseEntity<String> tryOn(
            @RequestParam String personUri,
            @RequestParam String productUri) throws IOException {

        virtualTryOnService.executeTryOn(personUri, productUri);
        return ResponseEntity.ok("Try-on initiated. Check your GCS results folder!");
    }


    @GetMapping("/seller")
    public ResponseEntity<List<ProductResponseDto>> getMyProducts() {
        // 1. Get the authenticated user's email from the JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Find the user
        User currentSeller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated seller not found"));

        // 3. Get products and map them to DTOs
        List<ProductResponseDto> dtos = productService.getProductsBySeller(currentSeller.getId());

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(@PathVariable Long id, @RequestBody ProductCreateDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        // Calls the service to get all products as DTOs
        return ResponseEntity.ok(productService.getAllProducts());
    }

}