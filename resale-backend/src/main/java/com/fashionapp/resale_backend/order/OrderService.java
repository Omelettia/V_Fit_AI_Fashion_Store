package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.order.dto.OrderResponseDto;
import com.fashionapp.resale_backend.product.ProductVariant;
import com.fashionapp.resale_backend.product.ProductVariantRepository;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional
    public OrderResponseDto placeOrder(OrderCreateDto dto) {
        // 1. SECURE: Get buyer from JWT, not from DTO
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Order order = new Order();
        order.setBuyer(buyer);
        order.setStatus("PENDING");
        order.setItems(new ArrayList<>());

        double total = 0;

        for (var itemDto : dto.getItems()) {
            ProductVariant variant = variantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found"));

            // Check & Update Stock
            if (variant.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + variant.getProduct().getName());
            }
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

        // Return clean DTO instead of entity to avoid recursion
        return mapToOrderResponse(savedOrder);
    }

    private OrderResponseDto mapToOrderResponse(Order order) {
        OrderResponseDto res = new OrderResponseDto();
        res.setOrderId(order.getId());
        res.setTotalAmount(order.getTotalAmount());
        res.setStatus(order.getStatus());
        return res;
    }
}