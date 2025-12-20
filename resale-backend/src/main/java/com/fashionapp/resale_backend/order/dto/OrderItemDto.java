package com.fashionapp.resale_backend.order.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long productVariantId;
    private Integer quantity;
}
