package com.fashionapp.resale_backend.address;

import com.fashionapp.resale_backend.address.dto.AddressCreateDto;
import com.fashionapp.resale_backend.address.dto.AddressResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    @GetMapping("/me")
    public ResponseEntity<List<AddressResponseDto>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    @PostMapping
    public ResponseEntity<AddressResponseDto> createAddress(@RequestBody AddressCreateDto dto) {
        return ResponseEntity.ok(addressService.createAddress(dto));
    }
}