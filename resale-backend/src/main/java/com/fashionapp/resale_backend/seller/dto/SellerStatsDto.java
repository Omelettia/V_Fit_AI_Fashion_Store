package com.fashionapp.resale_backend.seller.dto;

public record SellerStatsDto(
        Double totalRevenue,
        Integer activeListings,
        Integer totalSales
) {}