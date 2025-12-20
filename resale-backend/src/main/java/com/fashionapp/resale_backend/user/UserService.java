package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        // 1. Check if email exists
        if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use!");
        }

        // 2. Create User Entity
        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setBalance(0.0);

        // 3. Assign Role
        Role role = roleRepository.findByName(registrationDto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.getRoles().add(role);

        return userRepository.save(user);
    }
}