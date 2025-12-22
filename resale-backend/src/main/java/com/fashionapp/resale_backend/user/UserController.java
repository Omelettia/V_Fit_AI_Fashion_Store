package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.common.storage.GcsService;
import com.fashionapp.resale_backend.config.JwtService;
import com.fashionapp.resale_backend.user.dto.LoginResponse;
import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import com.fashionapp.resale_backend.user.dto.LoginRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final GcsService gcsService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationDto registrationDto) {
        User savedUser = userService.registerUser(registrationDto);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/{userId}/upload-photo")
    @Transactional
    public ResponseEntity<UserPhoto> uploadPhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Upload to the "users" folder in GCS
        String gcsUri = gcsService.uploadFile(file, "users");

        UserPhoto photo = new UserPhoto();
        photo.setUrl(gcsUri); // Stores the gs:// URI
        photo.setUser(user);

        return ResponseEntity.ok(userPhotoRepository.save(photo));
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
}