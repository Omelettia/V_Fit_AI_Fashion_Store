package com.fashionapp.resale_backend.address;

import com.fashionapp.resale_backend.address.dto.AddressCreateDto;
import com.fashionapp.resale_backend.address.dto.AddressResponseDto;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponseDto> getMyAddresses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return addressRepository.findByUserId(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressResponseDto createAddress(AddressCreateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        // If this is the first address or set to default, handle logic
        if (dto.isDefault()) {
            handleDefaultReset(user.getId());
        }

        Address address = new Address();
        address.setUser(user);
        updateAddressFields(address, dto);

        return mapToResponse(addressRepository.save(address));
    }

    private void handleDefaultReset(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setDefault(false));
        addressRepository.saveAll(addresses);
    }

    private void updateAddressFields(Address address, AddressCreateDto dto) {
        address.setFullName(dto.getFullName());
        address.setPhoneNumber(dto.getPhoneNumber());
        address.setStreetAddress(dto.getStreetAddress());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPostalCode(dto.getPostalCode());
        address.setCountry(dto.getCountry());
        address.setDefault(dto.isDefault());
    }

    private AddressResponseDto mapToResponse(Address address) {
        AddressResponseDto res = new AddressResponseDto();
        res.setId(address.getId());
        res.setFullName(address.getFullName());
        res.setPhoneNumber(address.getPhoneNumber());
        res.setStreetAddress(address.getStreetAddress());
        res.setCity(address.getCity());
        res.setState(address.getState());
        res.setPostalCode(address.getPostalCode());
        res.setCountry(address.getCountry());
        res.setDefault(address.isDefault());
        return res;
    }
}