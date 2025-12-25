package com.fashionapp.resale_backend.order.dto;

import lombok.Data;

@Data
public class OrderResponseDto {
    private Long orderId;
    private String status;
    private Double totalAmount;
    private String shippingAddress; // The permanent string snapshot
    private String receiverName;     // The permanent string snapshot

    private String paymentMethod;
}