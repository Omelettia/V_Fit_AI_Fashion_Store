package com.fashionapp.resale_backend.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<Payment> pay(@PathVariable Long orderId, @RequestParam String method) {
        return ResponseEntity.ok(paymentService.processPayment(orderId, method));
    }
}