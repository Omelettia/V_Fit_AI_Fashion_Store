package com.fashionapp.resale_backend.user.dto;

public record ProfileUpdateDto(
        String firstName,
        String lastName,
        Double height,
        Double weight,
        String shopName
) {}