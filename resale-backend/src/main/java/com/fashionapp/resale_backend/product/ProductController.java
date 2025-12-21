package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.config.CloudinaryService;
import com.fashionapp.resale_backend.product.dto.ProductCreateDto;
import com.fashionapp.resale_backend.product.dto.ProductResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody ProductCreateDto dto) {
        return ResponseEntity.ok(productService.createProduct(dto));
    }

    @PostMapping("/{productId}/upload-images")
    public ResponseEntity<ProductResponseDto> uploadProductImages(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        for (MultipartFile file : files) {
            String cloudUrl = cloudinaryService.uploadFile(file);
            ProductImage image = new ProductImage();
            image.setUrl(cloudUrl);
            image.setProduct(product);
            productImageRepository.save(image);
        }

        // Return the updated product view
        return ResponseEntity.ok(productService.mapToResponse(product));
    }
}