package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.product.dto.ProductCreateDto;
import com.fashionapp.resale_backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          UserRepository userRepository, ProductVariantRepository variantRepository,
                          ProductImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public Product createProduct(ProductCreateDto dto) {
        // 1. Create Product
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setBrand(dto.getBrand());
        product.setCondition(dto.getCondition());

        product.setCategory(categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found")));
        product.setSeller(userRepository.findById(dto.getSellerId())
                .orElseThrow(() -> new RuntimeException("Seller not found")));

        Product savedProduct = productRepository.save(product);

        // 2. Save Variants
        dto.getVariants().forEach(vDto -> {
            ProductVariant variant = new ProductVariant();
            variant.setSize(vDto.getSize());
            variant.setColor(vDto.getColor());
            variant.setStockQuantity(vDto.getStockQuantity());
            variant.setProduct(savedProduct);
            variantRepository.save(variant);
        });

        // 3. Save Images
        dto.getImageUrls().forEach(url -> {
            ProductImage img = new ProductImage();
            img.setUrl(url);
            img.setProduct(savedProduct);
            imageRepository.save(img);
        });

        return savedProduct;
    }
}