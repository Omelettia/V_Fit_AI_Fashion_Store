package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.order.Order;
import com.fashionapp.resale_backend.order.OrderRepository;
import com.fashionapp.resale_backend.product.ProductRepository;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * Splits the order total into individual payouts for each seller involved.
     * Updates seller balances and records payout history.
     */
    @Transactional
    public void createPayout(Long orderId) {
        // 1. Find the PAID order
        Order order = orderRepository.findById(orderId)
                .filter(o -> "PAID".equals(o.getStatus()))
                .orElseThrow(() -> new RuntimeException("Order not paid or not found"));

        log.info("Processing multi-seller payouts for Order ID: {}", orderId);

        // 2. Group items by Seller and calculate the subtotal for each seller
        // Key: Seller (User), Value: Subtotal (Sum of price * quantity for that seller's items)
        Map<User, Double> sellerSubtotals = order.getItems().stream()
                .collect(Collectors.groupingBy(
                        item -> item.getProductVariant().getProduct().getSeller(),
                        Collectors.summingDouble(item -> item.getPrice() * item.getQuantity())
                ));

        // 3. Iterate through each seller to create individual Payout records
        sellerSubtotals.forEach((seller, totalAmount) -> {
            log.debug("Creating payout for Seller: {} | Amount: {}", seller.getEmail(), totalAmount);

            // Create Payout record
            Payout payout = new Payout();
            payout.setSeller(seller);
            payout.setAmount(totalAmount);
            payout.setStatus("COMPLETED");
            payout.setArrivalDate(LocalDateTime.now());

            payout.setOrder(order);

            // 4. Update the specific Seller's Balance
            seller.setBalance(seller.getBalance() + totalAmount);

            // Save both the updated user and the new payout record
            userRepository.save(seller);
            payoutRepository.save(payout);
        });

        log.info("Successfully completed payouts for {} sellers from Order ID: {}", sellerSubtotals.size(), orderId);
    }



}