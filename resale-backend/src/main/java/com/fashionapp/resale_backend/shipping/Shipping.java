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

    // Snapshot fields: These store strings, not references
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress; // Full concatenated address string

    private String trackingNumber;
    private String carrier;
    private String status; // e.g., "PENDING", "SHIPPED", "DELIVERED"
}