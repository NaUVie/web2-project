package com.rainbowforest.orderservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserProfileUpdatedConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private OrderService orderService;

    @KafkaListener(topics = "user-profile-updates", groupId = "user-profile-order-group")
    public void consumeProfileUpdate(String message) {
        try {
            UserProfileUpdatedEvent event = objectMapper.readValue(message, UserProfileUpdatedEvent.class);
            System.out.println("======> ORDER SERVICE [Kafka]: Received User Profile Updated Event for User ID: " + event.getUserId());
            System.out.println("======> ORDER SERVICE [Kafka]: Preserving original checkout details for all existing orders.");
        } catch (Exception e) {
            System.err.println("Error processing user profile updated event: " + e.getMessage());
        }
    }
}
