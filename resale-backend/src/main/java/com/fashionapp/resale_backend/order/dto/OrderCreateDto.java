package com.fashionapp.resale_backend.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderCreateDto {
    private Long buyerId;
    private List<OrderItemDto> items;
}

