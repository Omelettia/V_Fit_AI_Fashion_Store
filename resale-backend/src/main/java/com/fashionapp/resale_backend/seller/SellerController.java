package com.fashionapp.resale_backend.seller;

import com.fashionapp.resale_backend.product.ProductService;
import com.fashionapp.resale_backend.product.dto.ProductResponseDto;
import com.fashionapp.resale_backend.seller.dto.SellerStatsDto;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SELLER')")
public class SellerController {

    private final ProductService productService;
    private final SellerService sellerService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<SellerStatsDto> getDashboardStats() {
        // Automatically identify the seller from the JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated seller not found"));

        return ResponseEntity.ok(sellerService.getStats(seller.getId()));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDto>> getSellerProducts() {
        // Automatically identify the seller from the JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated seller not found"));

        return ResponseEntity.ok(productService.getProductsBySeller(seller.getId()));
    }
}