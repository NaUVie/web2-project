package com.rainbowforest.userservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserProfileEventProducer {

    private static final String TOPIC = "user-profile-updates";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendProfileUpdatedEvent(UserProfileUpdatedEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, message);
            System.out.println("======> USER SERVICE [Kafka]: Sent User Profile Updated Event: " + message);
        } catch (Exception e) {
            System.err.println("Failed to send User Profile Updated Event: " + e.getMessage());
        }
    }
}
