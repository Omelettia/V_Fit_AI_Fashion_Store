package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.order.dto.OrderResponseDto;
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
    public ResponseEntity<OrderResponseDto> placeOrder(@RequestBody OrderCreateDto dto) {
        OrderResponseDto response = orderService.placeOrder(dto);

        return ResponseEntity.ok(response);
    }
}