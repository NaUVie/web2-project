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

        User user = null;
        try {
            user = userClient.getUserById(userId);
        } catch (Exception ex) {
            // Xử lý khi user-service báo lỗi hoặc không tìm thấy user
        }

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
            cartService.deleteCart(activeCartId);

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
                OrderEvent event = new OrderEvent(
                        order.getId(),
                        user.getId(),
                        user.getUserName(),
                        user.getUserName() + "@gmail.com",
                        order.getTotal(),
                        order.getStatus(),
                        items
                );
                orderEventProducer.sendOrderEvent(event);
            } catch (Exception kafkaEx) {
                System.err.println("Failed to send Kafka event: " + kafkaEx.getMessage());
            }

            String paymentUrl = "";
            if ("BANK".equalsIgnoreCase(order.getPaymentMethod())) {
                try {
                    Map<String, String> paymentResponse = paymentClient.getPaymentUrl(order.getId());
                    if (paymentResponse != null && paymentResponse.containsKey("paymentUrl")) {
                        paymentUrl = paymentResponse.get("paymentUrl");
                    }
                } catch (Exception ex) {
                    System.err.println("Failed to generate VNPay URL from payment service: " + ex.getMessage());
                }
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
            ex.printStackTrace();
            return new ResponseEntity<>("Đã xảy ra lỗi hệ thống khi lưu đơn hàng.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
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
                System.err.println("Failed to send Kafka event on status update: " + kafkaEx.getMessage());
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
