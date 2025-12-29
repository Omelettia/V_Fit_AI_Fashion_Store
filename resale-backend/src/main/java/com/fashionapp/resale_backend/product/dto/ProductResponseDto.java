package com.fashionapp.resale_backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private Double basePrice;
    private String brand;
    private String condition;
    private String categoryName;
    private String sellerShopName;
    private String status;
    private List<ProductVariantDto> variants;


    private List<ProductImageDto> images;
}