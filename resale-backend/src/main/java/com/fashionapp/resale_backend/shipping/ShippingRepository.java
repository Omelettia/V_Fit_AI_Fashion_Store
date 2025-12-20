package com.fashionapp.resale_backend.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    // Allows you to track the package for a specific order
    Optional<Shipping> findByOrderId(Long orderId);
}