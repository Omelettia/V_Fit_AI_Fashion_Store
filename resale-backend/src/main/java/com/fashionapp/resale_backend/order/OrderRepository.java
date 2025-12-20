package com.fashionapp.resale_backend.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Allows you to fetch all orders for a specific buyer
    List<Order> findByBuyerId(Long buyerId);

    // Useful for admin dashboards to see orders by status
    List<Order> findByStatus(String status);
}