package com.fashionapp.resale_backend.user;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_photos")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String gcsUri;

    private String photoType; // e.g., "FULL_BODY", "PORTRAIT"
    private boolean isPrimary = false;


    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-photos") // Matches parent name in User
    private User user;
}