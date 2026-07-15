package com.rainbowforest.orderservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderCompensationConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private OrderService orderService;

    @Autowired
    private EmailService emailService;

    private static final String ADMIN_EMAIL = "admin@nexusshop.com";

    @KafkaListener(topics = "order-compensation-events", groupId = "order-compensation-group")
    public void consumeCompensation(String message) {
        try {
            StockCompensationEvent event = objectMapper.readValue(message, StockCompensationEvent.class);
            System.err.println("======> ORDER SERVICE [Saga Compensation]: Received stock compensation event for Order ID: " + 
                               event.getOrderId() + ". Reason: " + event.getReason());
            
            Order order = orderService.getOrderById(event.getOrderId());
            if (order != null) {
                // Roll back order status
                String previousStatus = order.getStatus();
                orderService.updateOrderStatus(order.getId(), "FAILED");
                System.err.println("======> ORDER SERVICE [Saga Compensation]: Rolled back Order ID " + 
                                   order.getId() + " status from " + previousStatus + " to FAILED");

                // System Notification to Admin (Requirement 4)
                String subject = "SAGA COMPENSATION ALERT: Order #" + order.getId() + " Failed";
                String body = "Dear Admin,\n\n" +
                              "A Saga transaction has triggered a compensation rollback.\n\n" +
                              "Order Details:\n" +
                              "- Order ID: #" + order.getId() + "\n" +
                              "- Customer: " + (order.getUser() != null ? order.getUser().getUserName() : "Guest") + "\n" +
                              "- Total Amount: $" + order.getTotal() + "\n" +
                              "- Compensation Reason: " + event.getReason() + "\n\n" +
                              "The order status has been automatically updated to FAILED. Please review the inventory records.";
                
                emailService.sendEmail(ADMIN_EMAIL, subject, body);
            }
        } catch (Exception e) {
            System.err.println("Error processing order compensation event: " + e.getMessage());
        }
    }
}
