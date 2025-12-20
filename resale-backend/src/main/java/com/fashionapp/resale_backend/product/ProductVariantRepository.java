package com.fashionapp.resale_backend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Allows you to find all sizes/colors for a specific product
    List<ProductVariant> findByProductId(Long productId);
}