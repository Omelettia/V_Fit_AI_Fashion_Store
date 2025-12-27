package com.fashionapp.resale_backend.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Fetches all orders for a buyer, newest first
    List<Order> findByBuyerIdOrderByOrderDateDesc(Long buyerId);

    List<Order> findByStatus(String status);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.productVariant.product.seller.id = :sellerId ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);
}