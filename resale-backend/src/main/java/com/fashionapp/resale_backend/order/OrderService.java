package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.product.ProductVariant;
import com.fashionapp.resale_backend.product.ProductVariantRepository;
import com.fashionapp.resale_backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
                        ProductVariantRepository variantRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional
    public Order placeOrder(OrderCreateDto dto) {
        Order order = new Order();
        order.setBuyer(userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new RuntimeException("Buyer not found")));
        order.setStatus("PENDING");
        order.setTotalAmount(0.0);
        order.setItems(new ArrayList<>());

        double total = 0;

        for (var itemDto : dto.getItems()) {
            ProductVariant variant = variantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // 1. Check & Update Stock
            if (variant.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + variant.getProduct().getName());
            }
            variant.setStockQuantity(variant.getStockQuantity() - itemDto.getQuantity());
            variantRepository.save(variant);

            // 2. Create Order Item
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductVariant(variant);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(variant.getProduct().getBasePrice()); // Record price at purchase

            total += (item.getPrice() * item.getQuantity());
            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }
}