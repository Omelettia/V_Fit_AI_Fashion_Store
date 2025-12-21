package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.product.dto.CategoryResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getAllCategoryTree() {
        // Fetch only root categories (those without a parent)
        List<Category> rootCategories = categoryRepository.findByParentCategoryIsNull();

        return rootCategories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponseDto mapToResponse(Category category) {
        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setId(category.getId());
        dto.setName(category.getName());

        if (category.getParentCategory() != null) {
            dto.setParentId(category.getParentCategory().getId());
        }

        // Recursively map subcategories
        if (category.getSubCategories() != null) {
            dto.setSubCategories(category.getSubCategories().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}