package com.rainbowforest.paymentservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDTO {
    private Long id;
    private String status;
    private String paymentMethod;
    private BigDecimal total;
}
