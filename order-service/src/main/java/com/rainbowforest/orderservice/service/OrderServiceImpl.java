package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Order saveOrder(Order order) {
        if (order.getUser() != null) {
            User user = order.getUser();
            if (user.getId() != null) {
                User existingUser = userRepository.findById(user.getId()).orElse(null);
                if (existingUser != null) {
                    order.setUser(existingUser);
                } else {
                    order.setUser(userRepository.save(user));
                }
            }
        }
        return orderRepository.save(order);
    }

    @Override
    public java.util.List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public java.util.List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    @Override
    public java.util.Map<String, Object> getRevenueStatistics() {
        java.util.List<Order> orders = orderRepository.findAll();
        java.math.BigDecimal totalRevenue = java.math.BigDecimal.ZERO;
        long completedCount = 0;
        long pendingCount = 0;
        long failedCount = 0;

        for (Order order : orders) {
            String status = order.getStatus();
            if ("COMPLETED".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)) {
                completedCount++;
                if (order.getTotal() != null) {
                    totalRevenue = totalRevenue.add(order.getTotal());
                }
            } else if ("PENDING".equalsIgnoreCase(status)) {
                pendingCount++;
            } else if ("FAILED".equalsIgnoreCase(status)) {
                failedCount++;
            }
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("completedOrdersCount", completedCount);
        stats.put("pendingOrdersCount", pendingCount);
        stats.put("failedOrdersCount", failedCount);
        stats.put("totalOrdersCount", (long) orders.size());
        return stats;
    }
}
