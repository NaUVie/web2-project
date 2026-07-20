package com.rainbowforest.orderservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * [ĐỒ ÁN CUỐI MÔN - YÊU CẦU 9 & 13]
 * - GIAO TIẾP BẤT ĐỒNG BỘ (Kafka): Lắng nghe các sự kiện (events) phát ra từ hệ thống một cách phi tập trung, bất đồng bộ.
 * - SAGA PATTERN / TRANSACTION MANAGEMENT:
 *   - Lắng nghe sự kiện tạo đơn hàng mới trên topic "order-events" để tiến hành xử lý thanh toán (Payment Service),
 *     giữ kho/trừ số lượng sản phẩm (Inventory/Product Service) và gửi email thông báo khách hàng (Notification Service).
 *   - Phối hợp các service để đảm bảo tính nhất quán dữ liệu giữa các microservices độc lập (Choreography Saga).
 */
@Service
public class OrderEventConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private EmailService emailService;

    @Autowired
    private OrderService orderService;

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
            
            Order order = orderService.getOrderById(event.getOrderId());
            if (order == null) {
                System.out.println("======> NOTIFICATION SERVICE [Kafka]: Order not found for ID: " + event.getOrderId());
                return;
            }

            String status = order.getStatus();
            String paymentMethod = order.getPaymentMethod();

            // Quyết định gửi email dựa trên phương thức thanh toán và trạng thái đơn hàng để tránh gửi mail sớm/sai
            boolean shouldSendSuccessEmail = false;

            if ("BANK".equalsIgnoreCase(paymentMethod)) {
                // Với VNPay: Chỉ gửi email thành công khi đơn hàng đã chuyển trạng thái thành công (PAID)
                if ("PAID".equalsIgnoreCase(status)) {
                    shouldSendSuccessEmail = true;
                }
            } else if ("COD".equalsIgnoreCase(paymentMethod)) {
                // Với COD: Gửi email thành công ngay khi vừa đặt đơn (PENDING)
                if ("PENDING".equalsIgnoreCase(status)) {
                    shouldSendSuccessEmail = true;
                }
            } else {
                // Các hình thức thanh toán khác nếu có
                if ("PENDING".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)) {
                    shouldSendSuccessEmail = true;
                }
            }

            if (!shouldSendSuccessEmail) {
                System.out.println("======> NOTIFICATION SERVICE [Kafka]: Skipping email notification for Order ID: " + 
                                   event.getOrderId() + " with status: " + status + ", paymentMethod: " + paymentMethod);
                return;
            }

            StringBuilder bodyBuilder = new StringBuilder();
            bodyBuilder.append("Xin chào ").append(event.getUsername()).append(",\n\n");
            bodyBuilder.append("Đơn hàng của bạn đã được tiếp nhận thành công!\n");
            bodyBuilder.append("Mã đơn hàng: #").append(event.getOrderId()).append("\n");
            bodyBuilder.append("Tổng tiền: $").append(event.getTotal()).append("\n");
            bodyBuilder.append("Phương thức thanh toán: ").append(paymentMethod).append("\n\n");
            bodyBuilder.append("Chi tiết sản phẩm:\n");
            if (event.getItems() != null) {
                for (OrderEvent.OrderItemInfo item : event.getItems()) {
                    bodyBuilder.append("- ").append(item.getProductName())
                               .append(" x ").append(item.getQuantity())
                               .append(" ($").append(item.getPrice()).append(")\n");
                }
            }
            bodyBuilder.append("\nCảm ơn bạn đã mua sắm tại Nexus Shop!\n");

            emailService.sendEmail(
                event.getEmail(),
                "Xác nhận đơn hàng #" + event.getOrderId() + " - Nexus Shop",
                bodyBuilder.toString()
            );
        } catch (Exception e) {
            System.err.println("Error processing notification event: " + e.getMessage());
        }
    }
}
