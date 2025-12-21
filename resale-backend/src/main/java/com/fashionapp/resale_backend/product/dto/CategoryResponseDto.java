package com.fashionapp.resale_backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponseDto {
    private Long id;
    private String name;
    private Long parentId;
    private List<CategoryResponseDto> subCategories; // Recursive list
}