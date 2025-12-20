package com.fashionapp.resale_backend.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String size;  // e.g., "M", "L", "32"
    private String color; // e.g., "Navy Blue"
    private Integer stockQuantity; // How many are available

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}