package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody OrderCreateDto dto) {
        return ResponseEntity.ok(orderService.placeOrder(dto));
    }
}