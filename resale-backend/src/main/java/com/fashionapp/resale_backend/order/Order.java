package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.payment.Payment;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.shipping.Shipping;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    private Double totalAmount;

    // Industrial Standards: PENDING_PAYMENT, PAID, SHIPPED, DELIVERED, CANCELLED
    private String status;

    // Added to track the chosen checkout method
    private String paymentMethod;

    private LocalDateTime orderDate = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Linking to the Shipping Snapshot
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Shipping shipping;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment; // Bidirectional link to the payment record
}