package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.address.dto.AddressCreateDto;
import com.fashionapp.resale_backend.config.JwtService;
import com.fashionapp.resale_backend.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationDto registrationDto) {
        return ResponseEntity.ok(userService.registerUser(registrationDto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            String token = jwtService.generateToken(user.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, user.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateDto updateDto) {
        return ResponseEntity.ok(userService.updateProfile(userId, updateDto));
    }

    @PostMapping("/{userId}/upload-photo")
    public ResponseEntity<UserPhoto> uploadPhoto(@PathVariable Long userId, @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(userService.addPhotoToGallery(userId, file));
    }

    @PostMapping("/{userId}/select-profile-picture/{photoId}")
    public ResponseEntity<User> selectProfilePicture(@PathVariable Long userId, @PathVariable Long photoId) {
        return ResponseEntity.ok(userService.setProfilePicture(userId, photoId));
    }

    @DeleteMapping("/{userId}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long userId, @PathVariable Long photoId) {
        userService.deletePhoto(userId, photoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/upgrade-to-seller")
    public ResponseEntity<User> upgradeToSeller(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.upgradeToSeller(userId));
    }

    // Endpoint to add a new address to the user profile
    @PostMapping("/{userId}/addresses")
    public ResponseEntity<User> addAddress(
            @PathVariable Long userId,
            @RequestBody AddressCreateDto addressDto) {
        return ResponseEntity.ok(userService.addAddress(userId, addressDto));
    }

    // Endpoint to delete an address from the user profile
    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}