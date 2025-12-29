package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.common.ai.VirtualTryOnService;
import com.fashionapp.resale_backend.common.storage.FileUploadResult;
import com.fashionapp.resale_backend.common.storage.GcsService;
import com.fashionapp.resale_backend.product.dto.*;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final GcsService gcsService;
    private final VirtualTryOnService virtualTryOnService;

    @Transactional
    public ProductResponseDto createProduct(ProductCreateDto dto) {
        User currentSeller = getAuthenticatedUser();

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setBrand(dto.getBrand());
        product.setCondition(dto.getCondition());

        product.setCategory(categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found")));

        product.setStatus("ACTIVE");

        product.setSeller(currentSeller);

        product.setVariants(new ArrayList<>());
        if (dto.getVariants() != null) {
            dto.getVariants().forEach(vDto -> {
                ProductVariant variant = new ProductVariant();
                variant.setSize(vDto.getSize());
                variant.setColor(vDto.getColor());
                variant.setStockQuantity(vDto.getStockQuantity());
                variant.setProduct(product);
                product.getVariants().add(variant);
            });
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Transactional
    public ProductResponseDto uploadProductImages(Long productId, MultipartFile[] files) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        validateOwnership(product);

        for (MultipartFile file : files) {
            FileUploadResult result = gcsService.uploadFile(file, "products");

            ProductImage image = new ProductImage();
            image.setUrl(result.publicUrl());
            image.setGcsUri(result.gcsUri());
            image.setProduct(product);

            productImageRepository.save(image);
        }

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProductImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Unauthorized image deletion");
        }

        validateOwnership(image.getProduct());

        // 1. Delete from Google Cloud Storage
        if (image.getGcsUri() != null) {
            gcsService.deleteFile(image.getGcsUri());
        }

        // 2. Delete from Database
        productImageRepository.delete(image);
    }

    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductCreateDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        validateOwnership(product);

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setBrand(dto.getBrand());
        product.setCondition(dto.getCondition());
        if (dto.getStatus() != null) {
            product.setStatus(dto.getStatus());
        }

        // Update variants (clearing and re-adding for simplicity)
        if (dto.getVariants() != null) {
            // Option A: If you want to allow changing stock/price without deleting the record:
            for (ProductVariantDto vDto : dto.getVariants()) {
                if (vDto.getId() != null) {
                    // Update existing variant if it belongs to this product
                    product.getVariants().stream()
                            .filter(v -> v.getId().equals(vDto.getId()))
                            .findFirst()
                            .ifPresent(existingV -> {
                                existingV.setSize(vDto.getSize());
                                existingV.setColor(vDto.getColor());
                                existingV.setStockQuantity(vDto.getStockQuantity());
                            });
                } else {
                    // Add as new
                    ProductVariant newVariant = new ProductVariant();
                    newVariant.setSize(vDto.getSize());
                    newVariant.setColor(vDto.getColor());
                    newVariant.setStockQuantity(vDto.getStockQuantity());
                    newVariant.setProduct(product);
                    product.getVariants().add(newVariant);
                }
            }
        }

        return mapToResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsBySeller(Long sellerId) {
        // Keeps your preferred naming convention
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponseDto mapToResponse(Product product) {
        ProductResponseDto response = new ProductResponseDto();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setBasePrice(product.getBasePrice());
        response.setBrand(product.getBrand());
        response.setCondition(product.getCondition());
        response.setStatus(product.getStatus());

        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }

        if (product.getSeller() != null) {
            response.setSellerShopName(product.getSeller().getShopName());
        }

        response.setVariants(product.getVariants().stream().map(v -> {
            ProductVariantDto vDto = new ProductVariantDto();
            vDto.setId(v.getId());
            vDto.setSize(v.getSize());
            vDto.setColor(v.getColor());
            vDto.setStockQuantity(v.getStockQuantity());
            return vDto;
        }).collect(Collectors.toList()));


        response.setImages(product.getImages().stream().map(img -> {
            ProductImageDto imgDto = new ProductImageDto();
            imgDto.setId(img.getId());
            imgDto.setUrl(img.getUrl());
            imgDto.setGcsUri(img.getGcsUri());
            return imgDto;
        }).collect(Collectors.toList()));

        return response;
    }

    public String executeTryOn(String personUri, String productUri) throws IOException {
        return virtualTryOnService.executeTryOn(personUri, productUri);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDto> getAllProductsPaginated(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    // Helper: Centralized Security Check
    private void validateOwnership(Product product) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!product.getSeller().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: You do not own this product.");
        }
    }

    // Helper: Centralized User Fetch
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}