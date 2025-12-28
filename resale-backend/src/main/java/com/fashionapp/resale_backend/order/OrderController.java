package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.order.dto.OrderResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> placeOrder(@RequestBody OrderCreateDto dto,HttpServletRequest request) {
        // Extract the client's IP address
        String ipAddress = request.getRemoteAddr();

        // Pass the IP to the service
        OrderResponseDto response = orderService.placeOrder(dto, ipAddress);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<OrderResponseDto>> getMyOrderHistory() {
        return ResponseEntity.ok(orderService.getMyOrderHistory());
    }

    @GetMapping("/my-sales")
    public ResponseEntity<List<OrderResponseDto>> getMySalesHistory() {
        return ResponseEntity.ok(orderService.getMySalesHistory());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetail(orderId));
    }
}