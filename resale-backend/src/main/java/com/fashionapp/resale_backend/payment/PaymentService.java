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
        // Overloaded method for WALLET (bypasses VNPay specific checks)
        return processPayment(orderId, method, 0.0, "00");
    }

    @Transactional
    public PaymentResponseDto processPayment(Long orderId, String method, double vnpAmount, String vnpResponseCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Skip the VNPAY security check for WALLET payments
        if ("VNPAY".equals(method)) {
            if (!"00".equals(vnpResponseCode)) {
                order.setStatus("FAILED_PAYMENT");
                orderRepository.save(order);
                throw new RuntimeException("Payment failed from VNPay");
            }
            if (order.getTotalAmount() * 100 != vnpAmount) {
                throw new RuntimeException("Security Alert: Invalid payment amount!");
            }
        }

        var existingPayment = paymentRepository.findByOrderId(orderId);
        if ("PAID".equals(order.getStatus()) && existingPayment.isPresent()) {
            return mapToPaymentResponse(existingPayment.get());
        }

        // Create the Payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(method);
        payment.setStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        // Ensure status is PAID
        order.setStatus("PAID");
        orderRepository.save(order);

        Payment savedPayment = paymentRepository.save(payment);
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