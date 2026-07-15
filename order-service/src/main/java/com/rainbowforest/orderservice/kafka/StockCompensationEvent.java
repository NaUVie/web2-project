package com.rainbowforest.orderservice.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockCompensationEvent implements Serializable {
    private Long orderId;
    private String reason;
}
