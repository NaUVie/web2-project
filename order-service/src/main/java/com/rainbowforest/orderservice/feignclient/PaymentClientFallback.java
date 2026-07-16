package com.rainbowforest.orderservice.feignclient;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentClientFallback implements PaymentClient {
    @Override
    public Map<String, String> getPaymentUrl(Long orderId) {
        Map<String, String> fallbackResponse = new HashMap<>();
        fallbackResponse.put("paymentUrl", "");
        fallbackResponse.put("error", "Payment service offline. Please try again later.");
        return fallbackResponse;
    }
}
