package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.order.Order;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payouts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private Double amount;
    private String status; // e.g., "PENDING", "PAID"
    private LocalDateTime arrivalDate;
}