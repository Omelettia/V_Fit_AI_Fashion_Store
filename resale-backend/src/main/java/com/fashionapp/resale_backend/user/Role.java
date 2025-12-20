package com.fashionapp.resale_backend.user;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "roles")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "ROLE_BUYER", "ROLE_SELLER"

    public Role(String name) {
        this.name = name;
    }
}
