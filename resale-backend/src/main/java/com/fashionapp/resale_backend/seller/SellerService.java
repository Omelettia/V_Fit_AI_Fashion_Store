package com.fashionapp.resale_backend.seller;

import com.fashionapp.resale_backend.product.ProductRepository;
import com.fashionapp.resale_backend.payment.Payout;
import com.fashionapp.resale_backend.payment.PayoutRepository;
import com.fashionapp.resale_backend.seller.dto.SellerStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final ProductRepository productRepository;
    private final PayoutRepository payoutRepository;

    @Transactional(readOnly = true)
    public SellerStatsDto getStats(Long sellerId) {
        // 1. Get real active listings count
        long activeCount = productRepository.countBySellerIdAndStatus(sellerId, "ACTIVE");

        // 2. Fetch all payout records for this seller
        List<Payout> payouts = payoutRepository.findBySellerId(sellerId);

        // 3. Calculate real revenue from completed payouts
        double totalRevenue = payouts.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(Payout::getAmount)
                .sum();

        // 4. Total sales is the number of payout events
        int totalSales = payouts.size();

        return new SellerStatsDto(totalRevenue, (int) activeCount, totalSales);
    }
}