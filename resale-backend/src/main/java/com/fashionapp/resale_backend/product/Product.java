package com.fashionapp.resale_backend.product;

import com.fashionapp.resale_backend.user.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(length = 1000)
    private String description;
    private Double basePrice;
    private String brand;
    private String condition;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonBackReference("user-products") // Matches parent name in User
    private User seller;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference("product-category") // Matches parent name in Category
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-variants") // Matches child name in ProductVariant
    private List<ProductVariant> variants;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-images") // Matches child name in ProductImage
    private List<ProductImage> images = new ArrayList<>();;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String status = "ACTIVE";
}