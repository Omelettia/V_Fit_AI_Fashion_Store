package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.order.Order;
import com.fashionapp.resale_backend.order.OrderRepository;
import com.fashionapp.resale_backend.payment.dto.PaymentResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PayoutService payoutService;

    @Transactional
    public PaymentResponseDto processPayment(Long orderId, String method) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("PAID".equals(order.getStatus())) {
            throw new RuntimeException("Order is already paid");
        }

        // 1. Create the Payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(method);
        payment.setStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        // 2. Update Order status to PAID
        order.setStatus("PAID");
        orderRepository.save(order);
        Payment savedPayment = paymentRepository.save(payment);

        // 3. AUTOMATED TRIGGER: Call the internal payout logic
        payoutService.createPayout(orderId);

        return mapToPaymentResponse(savedPayment);
    }

    private PaymentResponseDto mapToPaymentResponse(Payment payment) {
        PaymentResponseDto res = new PaymentResponseDto();
        res.setId(payment.getId());
        res.setOrderId(payment.getOrder().getId());
        res.setAmount(payment.getAmount());
        res.setStatus(payment.getStatus());
        res.setPaymentMethod(payment.getPaymentMethod());
        res.setPaymentDate(payment.getPaymentDate());
        return res;
    }
}