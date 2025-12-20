package com.fashionapp.resale_backend.product;

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
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory")
    private List<Category> subCategories;
    public Category(String name, Category parentCategory) {
        this.name = name;
        this.parentCategory = parentCategory;
    }
}