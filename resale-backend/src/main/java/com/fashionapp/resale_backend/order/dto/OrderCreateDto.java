package com.fashionapp.resale_backend.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderCreateDto {
    private Long addressId; // Optional: ID of a saved address

    // One-time address fields (used if addressId is null)
    private String receiverName;
    private String receiverPhone;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;

    private String paymentMethod; // "COD" or "DIGITAL"

    private List<OrderItemDto> items;
}