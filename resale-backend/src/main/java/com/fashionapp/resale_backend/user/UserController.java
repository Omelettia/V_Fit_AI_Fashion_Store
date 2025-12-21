package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.config.CloudinaryService;
import com.fashionapp.resale_backend.config.JwtService;
import com.fashionapp.resale_backend.user.dto.LoginResponse;
import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fashionapp.resale_backend.user.dto.LoginRequest;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    // Inject the new dependencies in the constructor
    public UserController(UserService userService,
                          UserRepository userRepository,
                          UserPhotoRepository userPhotoRepository,
                          CloudinaryService cloudinaryService,
                          JwtService jwtService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.cloudinaryService = cloudinaryService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationDto registrationDto) {
        User savedUser = userService.registerUser(registrationDto);
        return ResponseEntity.ok(savedUser);
    }

    // New endpoint for uploading a profile photo
    @PostMapping("/{userId}/upload-photo")
    public ResponseEntity<UserPhoto> uploadPhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Upload to Cloudinary
        String cloudUrl = cloudinaryService.uploadFile(file);

        // 2. Save the URL to our database
        UserPhoto photo = new UserPhoto();
        photo.setUrl(cloudUrl);
        photo.setUser(user);

        return ResponseEntity.ok(userPhotoRepository.save(photo));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

            // Generate the "ID Card" (Token)
            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(new LoginResponse(token, user.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}