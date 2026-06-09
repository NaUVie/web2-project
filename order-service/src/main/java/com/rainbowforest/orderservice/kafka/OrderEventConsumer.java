package com.rainbowforest.orderservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderEventConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void consumePayment(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            System.out.println("======> PAYMENT SERVICE [Kafka]: Received Order Created Event. Processing payment for Order ID: " + event.getOrderId());
            System.out.println("======> PAYMENT SERVICE [Kafka]: Successfully processed payment of $" + event.getTotal() + " for user " + event.getUsername());
        } catch (Exception e) {
            System.err.println("Error processing payment event: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void consumeInventory(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            System.out.println("======> INVENTORY SERVICE [Kafka]: Received Order Created Event. Verifying and reserving stock for Order ID: " + event.getOrderId());
            for (OrderEvent.OrderItemInfo item : event.getItems()) {
                System.out.println("======> INVENTORY SERVICE [Kafka]: Reserved " + item.getQuantity() + " units of Product: " + item.getProductName());
            }
            System.out.println("======> INVENTORY SERVICE [Kafka]: Stock reservation completed for Order ID: " + event.getOrderId());
        } catch (Exception e) {
            System.err.println("Error processing inventory event: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void consumeNotification(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            System.out.println("======> NOTIFICATION SERVICE [Kafka]: Preparing customer notifications for Order ID: " + event.getOrderId());
            System.out.println("======> NOTIFICATION SERVICE [Kafka]: Sent email confirmation to " + event.getEmail() + " | Subject: Order #" + event.getOrderId() + " Confirmed!");
        } catch (Exception e) {
            System.err.println("Error processing notification event: " + e.getMessage());
        }
    }
}
