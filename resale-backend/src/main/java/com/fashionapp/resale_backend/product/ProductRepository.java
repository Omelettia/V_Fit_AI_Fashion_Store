package com.fashionapp.resale_backend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId); // Find all items belonging to a specific seller
    // Count active listings for the dashboard stats
    long countBySellerId(Long sellerId);
}