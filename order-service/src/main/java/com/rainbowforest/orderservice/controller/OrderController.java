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

            return new ResponseEntity<Order>(
            		order, 
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
        order.setStatus("PAYMENT_EXPECTED");
        return order;
    }
}
