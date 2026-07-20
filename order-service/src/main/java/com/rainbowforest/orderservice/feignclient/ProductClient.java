package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.Product;

/**
 * [ĐỒ ÁN CUỐI MÔN - YÊU CẦU 8 & 13]
 * - GIAO TIẾP ĐỒNG BỘ (OpenFeign): Order-Service gọi đồng bộ tới Product-Catalog-Service thông qua OpenFeign Client.
 * - CIRCUIT BREAKER: Tích hợp cơ chế Circuit Breaker của Resilience4j qua thuộc tính `fallback = ProductClientFallback.class`
 *   để xử lý lỗi và phục hồi hệ thống khi Product Service gặp sự cố ngắt kết nối.
 */
@FeignClient(name = "product-catalog-service", fallback = ProductClientFallback.class)
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);

}
