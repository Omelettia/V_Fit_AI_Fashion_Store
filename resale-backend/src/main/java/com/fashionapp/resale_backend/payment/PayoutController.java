package com.fashionapp.resale_backend.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payouts")
public class PayoutController {

    private final PayoutService payoutService;

    public PayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<Payout> processPayout(@PathVariable Long orderId) {
        return ResponseEntity.ok(payoutService.createPayout(orderId));
    }
}