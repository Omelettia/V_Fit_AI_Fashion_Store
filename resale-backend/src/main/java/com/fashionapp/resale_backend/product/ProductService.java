package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.product.dto.*;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductResponseDto createProduct(ProductCreateDto dto) {
        // 1. Get the authenticated user's email from the JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Find the actual Seller in the database
        User currentSeller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated seller not found"));

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setBrand(dto.getBrand());
        product.setCondition(dto.getCondition());

        // Link Category
        product.setCategory(categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found")));

        // 3. SECURE STEP: Force the seller to be the logged-in user
        product.setSeller(currentSeller);

        // Initialize lists and use bidirectional linking for Cascading
        product.setVariants(new ArrayList<>());
        if (dto.getVariants() != null) {
            dto.getVariants().forEach(vDto -> {
                ProductVariant variant = new ProductVariant();
                variant.setSize(vDto.getSize());
                variant.setColor(vDto.getColor());
                variant.setStockQuantity(vDto.getStockQuantity());
                variant.setProduct(product); // Link back to parent
                product.getVariants().add(variant);
            });
        }

        product.setImages(new ArrayList<>());
        if (dto.getImageUrls() != null) {
            dto.getImageUrls().forEach(url -> {
                ProductImage img = new ProductImage();
                img.setUrl(url);
                img.setProduct(product);
                product.getImages().add(img);
            });
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public ProductResponseDto mapToResponse(Product product) {
        ProductResponseDto response = new ProductResponseDto();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setBasePrice(product.getBasePrice());
        response.setBrand(product.getBrand());
        response.setCondition(product.getCondition());

        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }

        if (product.getSeller() != null) {
            response.setSellerShopName(product.getSeller().getShopName());
        }

        response.setVariants(product.getVariants().stream().map(v -> {
            ProductVariantDto vDto = new ProductVariantDto();
            vDto.setSize(v.getSize());
            vDto.setColor(v.getColor());
            vDto.setStockQuantity(v.getStockQuantity());
            return vDto;
        }).collect(Collectors.toList()));

        response.setImageUrls(product.getImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList()));

        return response;
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsBySeller(Long sellerId) {
        // 1. Fetch the raw entities from the repository
        List<Product> products = productRepository.findBySellerId(sellerId);

        // 2. Map the entities to Response DTOs
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductCreateDto dto) {
        // 1. Find the existing product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Security Check: Ensure the logged-in user owns this product
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!product.getSeller().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to edit this product");
        }

        // 3. Update basic details
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setBrand(dto.getBrand());
        product.setCondition(dto.getCondition());

        // 4. Update Variants
        product.getVariants().clear();
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

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        // 1. Fetch all products from the database
        List<Product> products = productRepository.findAll();

        // 2. Map the entities to Response DTOs
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}