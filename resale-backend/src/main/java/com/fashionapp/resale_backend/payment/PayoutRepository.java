package com.fashionapp.resale_backend.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
    // Allows you to fetch all payouts for a specific seller
    List<Payout> findBySellerId(Long sellerId);
}