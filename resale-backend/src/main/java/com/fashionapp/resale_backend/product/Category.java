package com.fashionapp.resale_backend.product;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference("category-parent")
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory")
    @JsonManagedReference("category-parent")
    private List<Category> subCategories;

    @OneToMany(mappedBy = "category")
    @JsonManagedReference("product-category")
    private List<Product> products;

    public Category(String name, Category parentCategory) {
        this.name = name;
        this.parentCategory = parentCategory;
    }
}