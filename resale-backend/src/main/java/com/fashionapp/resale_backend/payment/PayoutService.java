package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.order.Order;
import com.fashionapp.resale_backend.order.OrderRepository;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PayoutService(PayoutRepository payoutRepository, OrderRepository orderRepository, UserRepository userRepository) {
        this.payoutRepository = payoutRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Payout createPayout(Long orderId) {
        // 1. Find the PAID order
        Order order = orderRepository.findById(orderId)
                .filter(o -> "PAID".equals(o.getStatus()))
                .orElseThrow(() -> new RuntimeException("Order not paid or not found"));

        // 2. Identify the Seller
        // Note: In our schema, the Product belongs to a Seller
        User seller = order.getItems().get(0).getProductVariant().getProduct().getSeller();

        // 3. Create Payout record
        Payout payout = new Payout();
        payout.setSeller(seller);
        payout.setAmount(order.getTotalAmount());
        payout.setStatus("COMPLETED");
        payout.setArrivalDate(LocalDateTime.now());

        // 4. Update Seller Balance
        seller.setBalance(seller.getBalance() + order.getTotalAmount());
        userRepository.save(seller);

        return payoutRepository.save(payout);
    }
}