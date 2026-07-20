package com.rainbowforest.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Objects;

/**
 * [ĐỒ ÁN CUỐI MÔN - YÊU CẦU 11: RATE LIMITING]
 * - Cấu hình giới hạn tần suất gửi yêu cầu (Rate Limiting) của Client bằng cách dùng Redis Token Bucket.
 * - Giới hạn số lượng request từ mỗi địa chỉ IP để chống Spam, chống tấn công DDoS cho hệ thống Microservices.
 */
@Configuration
public class RateLimiterConfig {

    /**
     * Giới hạn tần suất request dựa vào IP của client.
     */
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
            Objects.requireNonNull(exchange.getRequest().getRemoteAddress()).getAddress().getHostAddress()
        );
    }
}
