package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.order.Order;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private Double amount;
    private String paymentMethod; // e.g., "STRIPE", "MOMO", "VNPAY"
    private String status; // e.g., "SUCCESS", "FAILED"
    private LocalDateTime paymentDate = LocalDateTime.now();
}