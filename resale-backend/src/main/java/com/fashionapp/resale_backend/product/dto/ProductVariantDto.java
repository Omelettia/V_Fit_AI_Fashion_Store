package com.fashionapp.resale_backend.product.dto;

import lombok.Data;

@Data
public class ProductVariantDto {
    private Long id;
    private String size;
    private String color;
    private Integer stockQuantity;
}