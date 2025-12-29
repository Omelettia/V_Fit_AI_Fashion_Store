package com.fashionapp.resale_backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductCreateDto {
    private String name;
    private String description;
    private Double basePrice;
    private String brand;
    private String condition;
    private Long categoryId;
    private Long sellerId;
    private List<ProductVariantDto> variants;
    private List<String> imageUrls;
    private String status;
}
