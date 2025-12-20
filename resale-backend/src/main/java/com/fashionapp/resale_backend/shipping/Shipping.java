package com.fashionapp.resale_backend.shipping;

import com.fashionapp.resale_backend.order.Order;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shippings")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shipping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String trackingNumber;
    private String carrier; // e.g., "Giao Hang Nhanh", "Viettel Post"
    private String shippingAddress;
    private String status; // e.g., "IN_TRANSIT", "DELIVERED"
}