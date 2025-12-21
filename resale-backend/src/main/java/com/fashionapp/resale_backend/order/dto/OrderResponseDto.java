package com.fashionapp.resale_backend.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderResponseDto {
    private Long orderId;
    private String status;
    private Double totalAmount;
    private String buyerName;
    private String shippingAddress;
    private List<OrderItemDto> items;
}