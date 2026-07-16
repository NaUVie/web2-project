package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.feignclient.PaymentClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import com.rainbowforest.orderservice.kafka.OrderEvent;
import com.rainbowforest.orderservice.kafka.OrderEventProducer;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.Iterator;
import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private OrderEventProducer orderEventProducer;
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<?> saveOrder(
    		@PathVariable("userId") Long userId,
            @RequestBody(required = false) java.util.Map<String, String> payload,
    		@RequestHeader(value = "Cookie", required = false) String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
    		HttpServletRequest request) {
    	
        String activeCartId = (headerUserId != null) ? headerUserId : cartId;
        if (activeCartId == null) {
            return new ResponseEntity<>("Yêu cầu không hợp lệ: Thiếu mã giỏ hàng (Cart ID).", HttpStatus.BAD_REQUEST);
        }

        List<Item> cart = cartService.getAllItemsFromCart(activeCartId);
        if (cart == null || cart.isEmpty()) {
            return new ResponseEntity<>("Thanh toán thất bại: Giỏ hàng của bạn đang trống.", HttpStatus.BAD_REQUEST);
        }

        if (payload != null && payload.containsKey("productIds") && payload.get("productIds") != null && !payload.get("productIds").trim().isEmpty()) {
            String productIdsStr = payload.get("productIds");
            List<Long> targetProductIds = java.util.Arrays.stream(productIdsStr.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(java.util.stream.Collectors.toList());
            cart = cart.stream()
                    .filter(item -> targetProductIds.contains(item.getProduct().getId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (cart.isEmpty()) {
            return new ResponseEntity<>("Thanh toán thất bại: Không tìm thấy sản phẩm được chọn trong giỏ hàng.", HttpStatus.BAD_REQUEST);
        }

        User user = fetchUserWithCircuitBreaker(userId);

        if (user == null) {
            return new ResponseEntity<>("Thanh toán thất bại: Người dùng không tồn tại.", HttpStatus.NOT_FOUND);
        }

        Order order = this.createOrder(cart, user);
        if (payload != null) {
            order.setFullName(payload.get("fullName"));
            order.setPhoneNumber(payload.get("phoneNumber"));
            order.setShippingAddress(payload.get("shippingAddress"));
            order.setPaymentMethod(payload.get("paymentMethod"));
        }

        try {
            orderService.saveOrder(order);
            for (Item item : cart) {
                cartService.deleteItemFromCart(activeCartId, item.getProduct().getId());
            }

            // Publish event to Kafka
            try {
                List<OrderEvent.OrderItemInfo> items = new ArrayList<>();
                for (Item item : cart) {
                    java.math.BigDecimal actualPrice = (item.getProduct().getPromoPrice() != null && item.getProduct().getPromoPrice().compareTo(java.math.BigDecimal.ZERO) > 0)
                            ? item.getProduct().getPromoPrice() : item.getProduct().getPrice();
                    items.add(new OrderEvent.OrderItemInfo(
                            item.getProduct().getId(),
                            item.getProduct().getProductName(),
                            item.getQuantity(),
                            actualPrice
                    ));
                }
                String userEmail = user.getUserName() + "@gmail.com";
                if (user.getUserDetails() != null && user.getUserDetails().containsKey("email")) {
                    Object emailObj = user.getUserDetails().get("email");
                    if (emailObj != null) {
                        userEmail = emailObj.toString();
                    }
                }

                OrderEvent event = new OrderEvent(
                        order.getId(),
                        user.getId(),
                        user.getUserName(),
                        userEmail,
                        order.getTotal(),
                        order.getStatus(),
                        items
                );
                orderEventProducer.sendOrderEvent(event);
            } catch (Exception kafkaEx) {
                log.error("[Kafka] Failed to send order-created event for orderId={}: {}", order.getId(), kafkaEx.getMessage());
            }

            String paymentUrl = "";
            if ("BANK".equalsIgnoreCase(order.getPaymentMethod())) {
                paymentUrl = fetchPaymentUrlWithCircuitBreaker(order.getId());
            }

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("order", order);
            if (paymentUrl != null && !paymentUrl.isEmpty()) {
                responseMap.put("paymentUrl", paymentUrl);
            }

            return new ResponseEntity<>(
            		responseMap, 
            		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
            		HttpStatus.CREATED);
        } catch (Exception ex) {
            log.error("[OrderController] Failed to save order for userId={}: {}", userId, ex.getMessage(), ex);
            return new ResponseEntity<>("Đã xảy ra lỗi hệ thống khi lưu đơn hàng.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // ─── Circuit Breaker helpers ───────────────────────────────────────────────

    /**
     * Gọi user-service để lấy thông tin user.
     * Circuit Breaker "userService" sẽ mở nếu user-service liên tục lỗi.
     */
    @CircuitBreaker(name = "userService", fallbackMethod = "fetchUserFallback")
    private User fetchUserWithCircuitBreaker(Long userId) {
        log.info("[CircuitBreaker] Calling user-service for userId={}", userId);
        return userClient.getUserById(userId);
    }

    private User fetchUserFallback(Long userId, Throwable t) {
        log.error("[CircuitBreaker] user-service unavailable for userId={}, reason={}", userId, t.getMessage());
        return null; // OrderController kiểm tra null và trả 404
    }

    /**
     * Gọi payment-service để lấy URL thanh toán VNPay.
     * Circuit Breaker "paymentService" sẽ mở nếu payment-service liên tục lỗi.
     */
    @CircuitBreaker(name = "paymentService", fallbackMethod = "fetchPaymentUrlFallback")
    private String fetchPaymentUrlWithCircuitBreaker(Long orderId) {
        log.info("[CircuitBreaker] Calling payment-service for orderId={}", orderId);
        Map<String, String> paymentResponse = paymentClient.getPaymentUrl(orderId);
        if (paymentResponse != null && paymentResponse.containsKey("paymentUrl")) {
            return paymentResponse.get("paymentUrl");
        }
        return "";
    }

    private String fetchPaymentUrlFallback(Long orderId, Throwable t) {
        log.error("[CircuitBreaker] payment-service unavailable for orderId={}, reason={}", orderId, t.getMessage());
        return ""; // Đơn hàng vẫn tạo được, chỉ thiếu link thanh toán
    }

    // ─────────────────────────────────────────────────────────────────────────

    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PENDING"); // Changed default to PENDING
        order.setPaymentStatus("UNPAID");
        return order;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equals("ROLE_ADMIN")) {
            return new ResponseEntity<>("Quyền truy cập bị từ chối: Chỉ quản trị viên mới có quyền xem toàn bộ đơn hàng.", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(orderService.getAllOrders(), HttpStatus.OK);
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        
        if (role == null || (!role.equals("ROLE_ADMIN") && (headerUserId == null || !headerUserId.equals(String.valueOf(userId))))) {
            return new ResponseEntity<>("Quyền truy cập bị từ chối: Bạn không sở hữu dữ liệu đơn hàng này.", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(orderService.getOrdersByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable("orderId") Long orderId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            return new ResponseEntity<>("Đơn hàng không tồn tại", HttpStatus.NOT_FOUND);
        }
        
        // Verify ownership
        if (role == null || (!role.equals("ROLE_ADMIN") && (headerUserId == null || order.getUser() == null || !headerUserId.equals(String.valueOf(order.getUser().getId()))))) {
            return new ResponseEntity<>("Quyền truy cập bị từ chối: Bạn không sở hữu đơn hàng này.", HttpStatus.FORBIDDEN);
        }
        
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        String paymentStatus = payload.get("paymentStatus");
        
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            if (status != null) {
                order.setStatus(status);
                if ("DELIVERED".equalsIgnoreCase(status)) {
                    order.setPaymentStatus("PAID");
                }
            }
            if (paymentStatus != null && !"DELIVERED".equalsIgnoreCase(status)) {
                order.setPaymentStatus(paymentStatus);
            }
            order = orderService.saveOrder(order);
            // Publish event to Kafka on status update (Saga Pattern)
            try {
                List<OrderEvent.OrderItemInfo> items = new java.util.ArrayList<>();
                if (order.getItems() != null) {
                    for (Item item : order.getItems()) {
                        java.math.BigDecimal actualPrice = (item.getProduct().getPromoPrice() != null && item.getProduct().getPromoPrice().compareTo(java.math.BigDecimal.ZERO) > 0)
                                ? item.getProduct().getPromoPrice() : item.getProduct().getPrice();
                        items.add(new OrderEvent.OrderItemInfo(
                                item.getProduct().getId(),
                                item.getProduct().getProductName(),
                                item.getQuantity(),
                                actualPrice
                        ));
                    }
                }
                OrderEvent event = new OrderEvent(
                        order.getId(),
                        order.getUser() != null ? order.getUser().getId() : null,
                        order.getUser() != null ? order.getUser().getUserName() : "guest",
                        order.getUser() != null ? order.getUser().getUserName() + "@gmail.com" : "guest@gmail.com",
                        order.getTotal(),
                        order.getStatus(),
                        items
                );
                orderEventProducer.sendOrderEvent(event);
            } catch (Exception kafkaEx) {
                log.error("[Kafka] Failed to send order-status-updated event for orderId={}: {}", orderId, kafkaEx.getMessage());
            }
            return new ResponseEntity<>(order, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/orders/statistics/revenue")
    public ResponseEntity<java.util.Map<String, Object>> getRevenueStatistics() {
        return new ResponseEntity<>(orderService.getRevenueStatistics(), HttpStatus.OK);
    }
}
