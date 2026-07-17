package com.rainbowforest.productcatalogservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class OrderEventConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private static final String COMPENSATION_TOPIC = "order-compensation-events";

    @KafkaListener(topics = "order-events", groupId = "catalog-group")
    @Transactional
    public void consumeOrderEvent(String message) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);
            
            // Only process stock deduction if the order status is updated to COMPLETED or DELIVERED
            if ("COMPLETED".equalsIgnoreCase(event.getStatus()) || "DELIVERED".equalsIgnoreCase(event.getStatus())) {
                System.out.println("======> CATALOG SERVICE [Kafka]: Received COMPLETED/DELIVERED Order Event. Deducting stock for Order ID: " + event.getOrderId());
                
                for (OrderEvent.OrderItemInfo item : event.getItems()) {
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    
                    if (product == null) {
                        String reason = "Product ID " + item.getProductId() + " not found.";
                        sendCompensationEvent(event.getOrderId(), reason);
                        throw new RuntimeException("Stock update failed: " + reason);
                    }

                    // Check if variant color/size was selected
                    boolean hasVariantSelected = (item.getColor() != null && !item.getColor().trim().isEmpty()) ||
                                                (item.getSize() != null && !item.getSize().trim().isEmpty());

                    ProductVariant matchedVariant = null;
                    if (hasVariantSelected) {
                        List<ProductVariant> variants = productVariantRepository.findByProductId(item.getProductId());
                        if (variants != null) {
                            for (ProductVariant v : variants) {
                                boolean colorMatch = (item.getColor() == null && v.getColor() == null) ||
                                                     (item.getColor() != null && item.getColor().equalsIgnoreCase(v.getColor()));
                                boolean sizeMatch = (item.getSize() == null && v.getSize() == null) ||
                                                    (item.getSize() != null && item.getSize().equalsIgnoreCase(v.getSize()));
                                if (colorMatch && sizeMatch) {
                                    matchedVariant = v;
                                    break;
                                }
                            }
                        }
                    }

                    if (matchedVariant != null) {
                        // Deduct from matching Variant
                        if (matchedVariant.getAvailability() < item.getQuantity()) {
                            String reason = "Insufficient stock for product variant " + product.getProductName() + 
                                           " (Color: " + matchedVariant.getColor() + ", Size: " + matchedVariant.getSize() + 
                                           "). Available: " + matchedVariant.getAvailability() + ", Requested: " + item.getQuantity();
                            sendCompensationEvent(event.getOrderId(), reason);
                            throw new RuntimeException("Stock update failed: " + reason);
                        }

                        int oldVarStock = matchedVariant.getAvailability();
                        matchedVariant.setAvailability(oldVarStock - item.getQuantity());
                        productVariantRepository.save(matchedVariant);

                        // Also deduct from main product stock to keep them in sync
                        int oldProdStock = product.getAvailability();
                        product.setAvailability(Math.max(0, oldProdStock - item.getQuantity()));
                        productRepository.save(product);

                        System.out.println("======> CATALOG SERVICE [Kafka]: Deducted " + item.getQuantity() + 
                                           " units from Product Variant: " + product.getProductName() + " [" + 
                                           matchedVariant.getColor() + " - " + matchedVariant.getSize() + "] (Variant Stock: " + 
                                           oldVarStock + " -> " + matchedVariant.getAvailability() + ")");
                    } else {
                        // Deduct from main Product directly
                        if (product.getAvailability() < item.getQuantity()) {
                            String reason = "Insufficient stock for product: " + product.getProductName() + 
                                           " (Available: " + product.getAvailability() + ", Requested: " + item.getQuantity() + ")";
                            sendCompensationEvent(event.getOrderId(), reason);
                            throw new RuntimeException("Stock update failed: " + reason);
                        }
                        
                        int oldStock = product.getAvailability();
                        product.setAvailability(oldStock - item.getQuantity());
                        productRepository.save(product);
                        
                        System.out.println("======> CATALOG SERVICE [Kafka]: Deducted " + item.getQuantity() + 
                                           " units from Product: " + product.getProductName() + " (Stock: " + oldStock + " -> " + product.getAvailability() + ")");
                    }
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
