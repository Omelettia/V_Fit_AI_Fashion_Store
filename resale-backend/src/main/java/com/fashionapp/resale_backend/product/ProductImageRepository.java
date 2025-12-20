package com.fashionapp.resale_backend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // Allows you to fetch the full photo gallery for a listing
    List<ProductImage> findByProductId(Long productId);
}