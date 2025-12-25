package com.fashionapp.resale_backend.user;

import com.fashionapp.resale_backend.address.Address;
import com.fashionapp.resale_backend.address.dto.AddressCreateDto;
import com.fashionapp.resale_backend.common.storage.FileUploadResult;
import com.fashionapp.resale_backend.common.storage.GcsService;
import com.fashionapp.resale_backend.user.dto.ProfileUpdateDto;
import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final GcsService gcsService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use!");
        }

        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setBalance(0.0);

        Role role = roleRepository.findByName(registrationDto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.getRoles().add(role);

        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    @Transactional
    public User upgradeToSeller(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role sellerRole = roleRepository.findByName("ROLE_SELLER")
                .orElseThrow(() -> new RuntimeException("ROLE_SELLER not initialized"));
        user.getRoles().add(sellerRole);
        return userRepository.save(user);
    }

    @Transactional
    public User updateProfile(Long userId, ProfileUpdateDto updateDto) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(updateDto.firstName());
        user.setLastName(updateDto.lastName());
        user.setHeight(updateDto.height());
        user.setWeight(updateDto.weight());
        user.setShopName(updateDto.shopName());
        return userRepository.save(user);
    }

    /**
     * Business logic for adding a photo to a user's gallery
     */
    @Transactional
    public UserPhoto addPhotoToGallery(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId).orElseThrow();

        FileUploadResult result = gcsService.uploadFile(file, "users");

        UserPhoto photo = new UserPhoto();
        photo.setUrl(result.publicUrl());
        photo.setGcsUri(result.gcsUri());
        photo.setUser(user);

        // If this is the user's first photo, make it the primary profile picture
        if (user.getPhotos().isEmpty()) {
            photo.setPrimary(true);
            user.setProfilePicture(photo);
        }

        return userPhotoRepository.save(photo);
    }

    @Transactional
    public User setProfilePicture(Long userId, Long photoId) {
        User user = userRepository.findById(userId).orElseThrow();

        user.getPhotos().forEach(p -> p.setPrimary(false));

        UserPhoto selectedPhoto = user.getPhotos().stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Photo not found in gallery"));

        selectedPhoto.setPrimary(true);
        user.setProfilePicture(selectedPhoto);

        return userRepository.save(user);
    }

    @Transactional
    public void deletePhoto(Long userId, Long photoId) {
        User user = userRepository.findById(userId).orElseThrow();
        UserPhoto photo = userPhotoRepository.findById(photoId).orElseThrow();

        if (user.getProfilePicture() != null && user.getProfilePicture().getId().equals(photoId)) {
            user.setProfilePicture(null);
        }

        gcsService.deleteFile(photo.getGcsUri());
        userPhotoRepository.delete(photo);
    }

    @Transactional
    public User addAddress(Long userId, AddressCreateDto addressDto) {
        User user = userRepository.findById(userId).orElseThrow();

        Address address = new Address();
        address.setUser(user);
        address.setFullName(addressDto.getFullName());
        address.setPhoneNumber(addressDto.getPhoneNumber());
        address.setStreetAddress(addressDto.getStreetAddress());
        address.setCity(addressDto.getCity());
        address.setState(addressDto.getState());
        address.setPostalCode(addressDto.getPostalCode());
        address.setCountry(addressDto.getCountry());
        address.setDefault(addressDto.isDefault());

        // If setting a new default, reset others
        if (address.isDefault()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
        }

        user.getAddresses().add(address);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the address within the user's collection to ensure ownership
        Address address = user.getAddresses().stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found or access denied"));

        user.getAddresses().remove(address);
        // Address is removed from DB via 'orphanRemoval = true' in User entity
        userRepository.save(user);
    }
}