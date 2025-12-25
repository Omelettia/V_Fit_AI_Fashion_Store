package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.address.Address;
import com.fashionapp.resale_backend.address.AddressRepository;
import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.order.dto.OrderResponseDto;
import com.fashionapp.resale_backend.product.ProductVariant;
import com.fashionapp.resale_backend.product.ProductVariantRepository;
import com.fashionapp.resale_backend.shipping.Shipping;
import com.fashionapp.resale_backend.shipping.ShippingRepository;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final AddressRepository addressRepository;
    private final ShippingRepository shippingRepository;

    @Transactional
    public OrderResponseDto placeOrder(OrderCreateDto dto) {
        // 1. Authenticate Buyer via Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Order order = new Order();
        order.setBuyer(buyer);
        order.setOrderDate(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        // 2. Set Payment Intent & Initial Status
        order.setPaymentMethod(dto.getPaymentMethod());
        if ("COD".equalsIgnoreCase(dto.getPaymentMethod())) {
            order.setStatus("PLACED_COD"); // Awaiting delivery & cash collection
        } else {
            order.setStatus("AWAITING_PAYMENT"); // Awaiting digital gateway response
        }

        double total = 0;

        // 3. Process Items & Validate Stock
        for (var itemDto : dto.getItems()) {
            ProductVariant variant = variantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found: " + itemDto.getProductVariantId()));

            if (variant.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + variant.getProduct().getName());
            }

            // Industrial Practice: Immediate inventory deduction
            variant.setStockQuantity(variant.getStockQuantity() - itemDto.getQuantity());
            variantRepository.save(variant);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductVariant(variant);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(variant.getProduct().getBasePrice());

            total += (item.getPrice() * item.getQuantity());
            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // 4. Create Shipping Snapshot (The Legal Record)
        Shipping shipping = new Shipping();
        shipping.setOrder(savedOrder);
        shipping.setStatus("PENDING");

        if (dto.getAddressId() != null) {
            // Path A: Use Saved Address ID
            Address address = addressRepository.findById(dto.getAddressId())
                    .filter(a -> a.getUser().getId().equals(buyer.getId()))
                    .orElseThrow(() -> new RuntimeException("Address invalid or unauthorized"));

            shipping.setReceiverName(address.getFullName());
            shipping.setReceiverPhone(address.getPhoneNumber());
            shipping.setShippingAddress(formatAddress(address.getStreetAddress(), address.getCity(), address.getPostalCode()));
        } else {
            // Path B: Use One-Time Manual Entry
            if (dto.getStreetAddress() == null) throw new RuntimeException("Shipping address details are required");
            shipping.setReceiverName(dto.getReceiverName());
            shipping.setReceiverPhone(dto.getReceiverPhone());
            shipping.setShippingAddress(formatAddress(dto.getStreetAddress(), dto.getCity(), dto.getPostalCode()));
        }

        shippingRepository.save(shipping);

        return mapToOrderResponse(savedOrder, shipping);
    }

    private String formatAddress(String street, String city, String zip) {
        return String.format("%s, %s, %s", street, city, zip);
    }

    private OrderResponseDto mapToOrderResponse(Order order, Shipping shipping) {
        OrderResponseDto res = new OrderResponseDto();
        res.setOrderId(order.getId());
        res.setTotalAmount(order.getTotalAmount());
        res.setStatus(order.getStatus());
        res.setPaymentMethod(order.getPaymentMethod());
        res.setReceiverName(shipping.getReceiverName());
        res.setShippingAddress(shipping.getShippingAddress());
        return res;
    }
}