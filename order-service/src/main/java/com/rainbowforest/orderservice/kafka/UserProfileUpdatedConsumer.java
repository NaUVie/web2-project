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
            
            List<Order> userOrders = orderService.getOrdersByUserId(event.getUserId());
            if (userOrders != null && !userOrders.isEmpty()) {
                int updatedCount = 0;
                for (Order order : userOrders) {
                    // Only update orders that are still PENDING (not yet completed/failed/shipped)
                    if ("PENDING".equalsIgnoreCase(order.getStatus())) {
                        if (event.getNewPhoneNumber() != null) {
                            order.setPhoneNumber(event.getNewPhoneNumber());
                        }
                        
                        StringBuilder addrBuilder = new StringBuilder();
                        if (event.getNewStreetNumber() != null) addrBuilder.append(event.getNewStreetNumber()).append(" ");
                        if (event.getNewStreet() != null) addrBuilder.append(event.getNewStreet());
                        if (event.getNewLocality() != null) addrBuilder.append(", ").append(event.getNewLocality());
                        if (event.getNewCountry() != null) addrBuilder.append(", ").append(event.getNewCountry());
                        if (event.getNewZipCode() != null) addrBuilder.append(" (Zip: ").append(event.getNewZipCode()).append(")");
                        
                        String newAddr = addrBuilder.toString().trim();
                        if (!newAddr.isEmpty()) {
                            order.setShippingAddress(newAddr);
                        }
                        
                        orderService.saveOrder(order);
                        updatedCount++;
                    }
                }
                System.out.println("======> ORDER SERVICE [Kafka]: Updated address/phone for " + 
                                   updatedCount + " PENDING orders belonging to User ID: " + event.getUserId());
            }
        } catch (Exception e) {
            System.err.println("Error processing user profile updated event: " + e.getMessage());
        }
    }
}
