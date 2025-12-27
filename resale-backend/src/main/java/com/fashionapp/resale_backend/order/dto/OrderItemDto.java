package com.fashionapp.resale_backend.order.dto;

import lombok.Data;

@Data
public class OrderItemDto {

    private Long productVariantId;
    private Integer quantity;


    private String productName;
    private Double price;
    private String imageUrl;

    private String size;
    private String color;
}