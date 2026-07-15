package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
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
import com.rainbowforest.orderservice.config.VNPayConfig;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

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
                    items.add(new OrderEvent.OrderItemInfo(
                            item.getProduct().getId(),
                            item.getProduct().getProductName(),
                            item.getQuantity(),
                            item.getProduct().getPrice()
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
                    // The total is already in VND
                    long amountInVnd = Math.round(order.getTotal().doubleValue());
                    long amountCent = amountInVnd * 100; // VNPAY requires amount * 100
                    
                    String vnp_TxnRef = String.valueOf(order.getId());
                    String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
                    
                    Map<String, String> vnp_Params = new HashMap<>();
                    vnp_Params.put("vnp_Version", "2.1.0");
                    vnp_Params.put("vnp_Command", "pay");
                    vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
                    vnp_Params.put("vnp_Amount", String.valueOf(amountCent));
                    vnp_Params.put("vnp_CurrCode", "VND");
                    
                    String returnUrl = (payload != null && payload.containsKey("returnUrl")) 
                            ? payload.get("returnUrl") 
                            : "http://localhost:8900/payment-result";
                            
                    vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
                    vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
                    vnp_Params.put("vnp_OrderType", "other");
                    vnp_Params.put("vnp_Locale", "vn");
                    vnp_Params.put("vnp_ReturnUrl", returnUrl);
                    vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));
                    
                    Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
                    java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
                    formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
                    String vnp_CreateDate = formatter.format(cld.getTime());
                    vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
                    
                    cld.add(Calendar.MINUTE, 15);
                    String vnp_ExpireDate = formatter.format(cld.getTime());
                    vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
                    
                    List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
                    Collections.sort(fieldNames);
                    
                    StringBuilder hashData = new StringBuilder();
                    StringBuilder query = new StringBuilder();
                    Iterator<String> itr = fieldNames.iterator();
                    while (itr.hasNext()) {
                        String fieldName = itr.next();
                        String fieldValue = vnp_Params.get(fieldName);
                        if ((fieldValue != null) && (fieldValue.length() > 0)) {
                            hashData.append(fieldName);
                            hashData.append('=');
                            hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                            
                            query.append(java.net.URLEncoder.encode(fieldName, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                            query.append('=');
                            query.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                            
                            if (itr.hasNext()) {
                                query.append('&');
                                hashData.append('&');
                            }
                        }
                    }
                    String queryUrl = query.toString();
                    String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
                    paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
                } catch (Exception ex) {
                    System.err.println("Failed to generate VNPay URL: " + ex.getMessage());
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

    @GetMapping("/orders/payment-confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return new ResponseEntity<>("Invalid signature", HttpStatus.BAD_REQUEST);
        }

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            if (!"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey())) {
                fields.put(entry.getKey(), entry.getValue());
            }
        }

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    // ignore
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        if (calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            String responseCode = queryParams.get("vnp_ResponseCode");
            String orderIdStr = queryParams.get("vnp_TxnRef");
            if ("00".equals(responseCode)) {
                Long orderId = Long.parseLong(orderIdStr);
                orderService.updateOrderStatus(orderId, "PAID");
                System.out.println("======> PAYMENT SERVICE: VNPay verified Order #" + orderId + " as PAID");

                Map<String, String> result = new HashMap<>();
                result.put("status", "SUCCESS");
                result.put("message", "Thanh toán thành công");
                return ResponseEntity.ok(result);
            } else {
                Map<String, String> result = new HashMap<>();
                result.put("status", "FAILED");
                result.put("message", "Thanh toán thất bại, mã lỗi: " + responseCode);
                return ResponseEntity.ok(result);
            }
        } else {
            return new ResponseEntity<>("Signature verification failed", HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/orders/{orderId}/payment-url")
    public ResponseEntity<?> getPaymentUrl(@PathVariable("orderId") Long orderId, HttpServletRequest request) {
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            return new ResponseEntity<>("Đơn hàng không tồn tại", HttpStatus.NOT_FOUND);
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus()) || !"BANK".equalsIgnoreCase(order.getPaymentMethod())) {
            return new ResponseEntity<>("Đơn hàng không ở trạng thái chờ thanh toán qua ngân hàng", HttpStatus.BAD_REQUEST);
        }

        try {
            long amountInVnd = Math.round(order.getTotal().doubleValue());
            long amountCent = amountInVnd * 100;
            
            String vnp_TxnRef = String.valueOf(order.getId());
            String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
            
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amountCent));
            vnp_Params.put("vnp_CurrCode", "VND");
            
            String returnUrl = "http://localhost/payment-result";
            
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));
            
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    
                    query.append(java.net.URLEncoder.encode(fieldName, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(responseMap);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi tạo link thanh toán: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PENDING"); // Changed default to PENDING
        return order;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return new ResponseEntity<>(orderService.getAllOrders(), HttpStatus.OK);
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable("userId") Long userId) {
        return new ResponseEntity<>(orderService.getOrdersByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable("orderId") Long orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            return new ResponseEntity<>(order, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        Order order = orderService.updateOrderStatus(orderId, status);
        if (order != null) {
            // Publish event to Kafka on status update (Saga Pattern)
            try {
                List<OrderEvent.OrderItemInfo> items = new java.util.ArrayList<>();
                if (order.getItems() != null) {
                    for (Item item : order.getItems()) {
                        items.add(new OrderEvent.OrderItemInfo(
                                item.getProduct().getId(),
                                item.getProduct().getProductName(),
                                item.getQuantity(),
                                item.getProduct().getPrice()
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
