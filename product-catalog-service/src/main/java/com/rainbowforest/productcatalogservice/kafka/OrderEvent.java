package com.rainbowforest.productcatalogservice.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent implements Serializable {
    private Long orderId;
    private Long userId;
    private String username;
    private String email;
    private BigDecimal total;
    private String status;
    private List<OrderItemInfo> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemInfo implements Serializable {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private String color;
        private String size;
    }
}
