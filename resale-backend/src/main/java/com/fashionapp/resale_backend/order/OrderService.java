package com.fashionapp.resale_backend.order;

import com.fashionapp.resale_backend.address.Address;
import com.fashionapp.resale_backend.address.AddressRepository;
import com.fashionapp.resale_backend.order.dto.OrderCreateDto;
import com.fashionapp.resale_backend.order.dto.OrderItemDto;
import com.fashionapp.resale_backend.order.dto.OrderResponseDto;
import com.fashionapp.resale_backend.payment.PaymentService;
import com.fashionapp.resale_backend.payment.VNPayService;
import com.fashionapp.resale_backend.product.ProductVariant;
import com.fashionapp.resale_backend.product.ProductVariantRepository;
import com.fashionapp.resale_backend.shipping.Shipping;
import com.fashionapp.resale_backend.shipping.ShippingRepository;
import com.fashionapp.resale_backend.user.User;
import com.fashionapp.resale_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final AddressRepository addressRepository;
    private final ShippingRepository shippingRepository;

    private final VNPayService vnpayService;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponseDto placeOrder(OrderCreateDto dto,String ipAddress) {
        //  Authenticate Buyer via Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Order order = new Order();
        order.setBuyer(buyer);
        order.setOrderDate(LocalDateTime.now());
        order.setItems(new ArrayList<>());



        double total = 0;

        //  Process Items & Validate Stock
        for (var itemDto : dto.getItems()) {
            ProductVariant variant = variantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found: " + itemDto.getProductVariantId()));

            if (variant.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + variant.getProduct().getName());
            }

            // Immediate inventory deduction
            variant.setStockQuantity(variant.getStockQuantity() - itemDto.getQuantity());
            variantRepository.save(variant);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductVariant(variant);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(variant.getProduct().getBasePrice());

            total += (item.getPrice() * item.getQuantity());
            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        //  Set Payment Intent & Initial Status
        order.setPaymentMethod(dto.getPaymentMethod());
        if ("COD".equalsIgnoreCase(dto.getPaymentMethod())) {
            order.setStatus("PLACED_COD"); // Awaiting delivery & cash collection
        } else if ("VNPAY".equalsIgnoreCase(dto.getPaymentMethod())) {
            order.setStatus("AWAITING_PAYMENT");
        } else if ("WALLET".equalsIgnoreCase(dto.getPaymentMethod())) {
            if (buyer.getBalance() < total) {
                throw new RuntimeException("Insufficient wallet balance");
            }
            // Deduct balance
            buyer.setBalance(buyer.getBalance() - total);
            userRepository.save(buyer);

            order.setStatus("AWAITING_PAYMENT");
        }
        Order savedOrder = orderRepository.save(order);

        //  Create Shipping Snapshot (The Legal Record)
        Shipping shipping = new Shipping();
        shipping.setOrder(savedOrder);
        shipping.setStatus("PENDING");

        if (dto.getAddressId() != null) {
            // Path A: Use Saved Address ID
            Address address = addressRepository.findById(dto.getAddressId())
                    .filter(a -> a.getUser().getId().equals(buyer.getId()))
                    .orElseThrow(() -> new RuntimeException("Address invalid or unauthorized"));

            shipping.setReceiverName(address.getFullName());
            shipping.setReceiverPhone(address.getPhoneNumber());
            shipping.setShippingAddress(formatAddress(address.getStreetAddress(), address.getCity(), address.getPostalCode()));
        } else {
            // Path B: Use One-Time Manual Entry
            if (dto.getStreetAddress() == null) throw new RuntimeException("Shipping address details are required");
            shipping.setReceiverName(dto.getReceiverName());
            shipping.setReceiverPhone(dto.getReceiverPhone());
            shipping.setShippingAddress(formatAddress(dto.getStreetAddress(), dto.getCity(), dto.getPostalCode()));
        }

        shippingRepository.save(shipping);

        // 5. Build Response and Generate VNPay URL
        OrderResponseDto response = mapToOrderResponse(savedOrder, shipping);

        if ("VNPAY".equalsIgnoreCase(dto.getPaymentMethod())) {

            String paymentUrl = vnpayService.createPaymentUrl(savedOrder, ipAddress);
            response.setPaymentUrl(paymentUrl);
        }
        if ("WALLET".equalsIgnoreCase(dto.getPaymentMethod())) {
            paymentService.processPayment(savedOrder.getId(), "WALLET");
        }

        return response;
    }

    private String formatAddress(String street, String city, String zip) {
        return String.format("%s, %s, %s", street, city, zip);
    }

    private OrderResponseDto mapToOrderResponse(Order order, Shipping shipping) {
        OrderResponseDto res = new OrderResponseDto();
        res.setOrderId(order.getId());
        res.setTotalAmount(order.getTotalAmount());
        res.setStatus(order.getStatus());
        res.setPaymentMethod(order.getPaymentMethod());
        res.setReceiverName(shipping.getReceiverName());
        res.setShippingAddress(shipping.getShippingAddress());

        res.setOrderDate(order.getOrderDate());
        List<String> summaries = order.getItems().stream()
                .map(item -> item.getQuantity() + "x " + item.getProductVariant().getProduct().getName())
                .collect(Collectors.toList());
        res.setItemSummaries(summaries);

        return res;
    }


    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrderHistory() {
        // 1. Identify the buyer
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Fetch orders and map them
        return orderRepository.findByBuyerIdOrderByOrderDateDesc(buyer.getId())
                .stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    private OrderResponseDto mapToHistoryResponse(Order order) {
        OrderResponseDto res = new OrderResponseDto();
        res.setOrderId(order.getId());
        res.setTotalAmount(order.getTotalAmount());
        res.setStatus(order.getStatus());
        res.setPaymentMethod(order.getPaymentMethod());
        res.setOrderDate(order.getOrderDate());

        // Optional: Include item summary in the history view
        List<String> itemSummaries = order.getItems().stream()
                .map(item -> item.getQuantity() + "x " + item.getProductVariant().getProduct().getName())
                .collect(Collectors.toList());
        res.setItemSummaries(itemSummaries);

        return res;
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMySalesHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findOrdersBySellerId(seller.getId())
                .stream()
                .map(order -> mapToSalesHistoryResponse(order, seller.getId()))
                .collect(Collectors.toList());
    }

    private OrderResponseDto mapToSalesHistoryResponse(Order order, Long sellerId) {
        OrderResponseDto res = new OrderResponseDto();
        res.setOrderId(order.getId());
        res.setStatus(order.getStatus());
        res.setPaymentMethod(order.getPaymentMethod());
        res.setOrderDate(order.getOrderDate());

        // 1. Calculate ONLY the subtotal for this specific seller
        double sellerSubtotal = order.getItems().stream()
                .filter(item -> item.getProductVariant().getProduct().getSeller().getId().equals(sellerId))
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        res.setTotalAmount(sellerSubtotal); // Overwrite with the partial total

        // 2. Filter item summaries to only show what they sold
        List<String> sellerItems = order.getItems().stream()
                .filter(item -> item.getProductVariant().getProduct().getSeller().getId().equals(sellerId))
                .map(item -> item.getQuantity() + "x " + item.getProductVariant().getProduct().getName())
                .collect(Collectors.toList());

        res.setItemSummaries(sellerItems);

        return res;
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderDetail(Long orderId) {
        // 1. Fetch the Order entity
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 2. Identify the current logged-in user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Security Check: Ensure the user is actually part of this order
        validateOrderAccess(order);

        // 4. Map basic shared data (ID, Date, Status, Payment Method)
        OrderResponseDto res = mapToHistoryResponse(order);

        // 5. Add Shipping Details (Standard for both buyer and seller to see)
        res.setShippingAddress(order.getShipping().getShippingAddress());
        res.setReceiverName(order.getShipping().getReceiverName());

        // 6. Role-Based Filtering Logic
        boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());

        List<OrderItemDto> itemDetails = order.getItems().stream()
                .filter(item -> {
                    // Buyers see everything; Sellers only see items where they are the owner
                    boolean isThisSellersItem = item.getProductVariant().getProduct().getSeller().getId().equals(currentUser.getId());
                    return isBuyer || isThisSellersItem;
                })
                .map(item -> {
                    OrderItemDto idto = new OrderItemDto();
                    idto.setProductName(item.getProductVariant().getProduct().getName());
                    idto.setPrice(item.getPrice());
                    idto.setQuantity(item.getQuantity());

                    // Map variant details
                    idto.setSize(item.getProductVariant().getSize());
                    idto.setColor(item.getProductVariant().getColor());

                    if (!item.getProductVariant().getProduct().getImages().isEmpty()) {
                        idto.setImageUrl(item.getProductVariant().getProduct().getImages().get(0).getUrl());
                    }
                    return idto;
                })
                .collect(Collectors.toList());

        res.setItems(itemDetails);

        // 7. Context-Aware Total Calculation
        if (isBuyer) {
            // Buyer sees the global total for the entire transaction
            res.setTotalAmount(order.getTotalAmount());
        } else {
            // Seller only sees the "Grand Total" of the items they actually sold
            double sellerSubtotal = itemDetails.stream()
                    .mapToDouble(i -> i.getPrice() * i.getQuantity())
                    .sum();
            res.setTotalAmount(sellerSubtotal);
        }

        return res;
    }

    private void validateOrderAccess(Order order) {
        // 1. Get the current logged-in user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check if the user is the Buyer
        boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());

        // 3. Check if the user is the Seller for ANY item in the order
        boolean isSeller = order.getItems().stream()
                .anyMatch(item -> item.getProductVariant().getProduct().getSeller().getId().equals(currentUser.getId()));

        // 4. If neither, block access
        if (!isBuyer && !isSeller) {
            throw new RuntimeException("Unauthorized: You do not have permission to view this order.");
        }
    }

}