package com.fashionapp.resale_backend.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    private boolean isMainImage = false; // The thumbnail shown in search results

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}