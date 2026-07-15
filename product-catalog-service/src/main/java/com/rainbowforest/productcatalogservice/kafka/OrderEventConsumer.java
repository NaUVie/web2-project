package com.rainbowforest.productcatalogservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderEventConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private static final String COMPENSATION_TOPIC = "order-compensation-events";

    @KafkaListener(topics = "order-events", groupId = "catalog-group")
    @Transactional
    public void consumeOrderEvent(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            
            // Only process stock deduction if the order status is updated to COMPLETED
            if ("COMPLETED".equalsIgnoreCase(event.getStatus())) {
                System.out.println("======> CATALOG SERVICE [Kafka]: Received COMPLETED Order Event. Deducting stock for Order ID: " + event.getOrderId());
                
                for (OrderEvent.OrderItemInfo item : event.getItems()) {
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    
                    if (product == null) {
                        String reason = "Product ID " + item.getProductId() + " not found.";
                        sendCompensationEvent(event.getOrderId(), reason);
                        throw new RuntimeException("Stock update failed: " + reason);
                    }
                    
                    if (product.getAvailability() < item.getQuantity()) {
                        String reason = "Insufficient stock for product: " + product.getProductName() + 
                                       " (Available: " + product.getAvailability() + ", Requested: " + item.getQuantity() + ")";
                        sendCompensationEvent(event.getOrderId(), reason);
                        throw new RuntimeException("Stock update failed: " + reason);
                    }
                    
                    // Deduct stock
                    int oldStock = product.getAvailability();
                    product.setAvailability(oldStock - item.getQuantity());
                    productRepository.save(product);
                    
                    System.out.println("======> CATALOG SERVICE [Kafka]: Deducted " + item.getQuantity() + 
                                       " units from Product: " + product.getProductName() + " (Stock: " + oldStock + " -> " + product.getAvailability() + ")");
                }
                
                System.out.println("======> CATALOG SERVICE [Kafka]: Stock deduction completed successfully for Order ID: " + event.getOrderId());
            }
        } catch (Exception e) {
            System.err.println("Error processing order status event for stock deduction: " + e.getMessage());
            // Re-throw so transaction rollback works if it's a runtime exception thrown inside the loop
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
        }
    }

    private void sendCompensationEvent(Long orderId, String reason) {
        try {
            StockCompensationEvent compensation = new StockCompensationEvent(orderId, reason);
            String message = objectMapper.writeValueAsString(compensation);
            kafkaTemplate.send(COMPENSATION_TOPIC, message);
            System.err.println("======> CATALOG SERVICE [Saga Compensation]: Published Stock Compensation Event: " + message);
        } catch (Exception e) {
            System.err.println("Failed to send stock compensation event: " + e.getMessage());
        }
    }
}
