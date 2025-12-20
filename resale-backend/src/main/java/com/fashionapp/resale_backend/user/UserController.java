package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationDto registrationDto) {
        User savedUser = userService.registerUser(registrationDto);
        return ResponseEntity.ok(savedUser);
    }
}