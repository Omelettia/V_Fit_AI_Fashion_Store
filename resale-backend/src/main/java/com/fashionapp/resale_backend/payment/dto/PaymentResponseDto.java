package com.fashionapp.resale_backend.payment.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDto {
    private Long id;
    private Long orderId;
    private Double amount;
    private String status;
    private String paymentMethod;
    private LocalDateTime paymentDate;
}