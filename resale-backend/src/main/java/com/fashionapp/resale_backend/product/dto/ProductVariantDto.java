package com.fashionapp.resale_backend.product.dto;

import lombok.Data;

@Data
public class ProductVariantDto {
    private String size;
    private String color;
    private Integer stockQuantity;
}