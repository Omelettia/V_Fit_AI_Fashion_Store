package com.fashionapp.resale_backend.seller;

import com.fashionapp.resale_backend.product.ProductRepository;
import com.fashionapp.resale_backend.user.UserRepository;
import com.fashionapp.resale_backend.seller.dto.SellerStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SellerStatsDto getStats(Long sellerId) {
        // Industrial logic: Aggregate data for the dashboard
        long activeCount = productRepository.countBySellerId(sellerId);

        // Note: In a real app, you'd calculate revenue from an 'Orders' table
        double mockRevenue = 0.0;
        int mockSales = 0;

        return new SellerStatsDto(mockRevenue, (int) activeCount, mockSales);
    }
}