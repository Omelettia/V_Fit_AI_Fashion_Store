package com.fashionapp.resale_backend.address;

import com.fashionapp.resale_backend.user.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    private String fullName;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private boolean isDefault = false; // Used for auto-selection in checkout
}