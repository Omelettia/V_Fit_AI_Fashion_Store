package com.fashionapp.resale_backend.address.dto;
import lombok.Data;

@Data
public class AddressCreateDto {
    private String fullName;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private boolean isDefault;
}

