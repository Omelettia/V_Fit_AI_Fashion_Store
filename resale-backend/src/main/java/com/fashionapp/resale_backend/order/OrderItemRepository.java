package com.fashionapp.resale_backend.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Allows you to fetch all individual items for a single order
    List<OrderItem> findByOrderId(Long orderId);
}
