package com.fashionapp.resale_backend.seller;

import com.fashionapp.resale_backend.product.Product;
import com.fashionapp.resale_backend.product.ProductService;
import com.fashionapp.resale_backend.product.dto.ProductResponseDto;
import com.fashionapp.resale_backend.seller.dto.SellerStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SELLER')")
public class SellerController {

    private final ProductService productService;
    private final SellerService sellerService;

    @GetMapping("/stats")
    public ResponseEntity<SellerStatsDto> getDashboardStats(@RequestParam Long sellerId) {
        return ResponseEntity.ok(sellerService.getStats(sellerId));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDto>> getSellerProducts(@RequestParam Long sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }
}