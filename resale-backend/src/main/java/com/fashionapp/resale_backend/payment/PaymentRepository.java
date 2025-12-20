package com.fashionapp.resale_backend.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Allows you to find the payment details for a specific order
    Optional<Payment> findByOrderId(Long orderId);
}