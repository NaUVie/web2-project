package com.rainbowforest.orderservice.feignclient;

import org.springframework.stereotype.Component;
import com.rainbowforest.orderservice.domain.Product;
import java.math.BigDecimal;

/**
 * [ĐỒ ÁN CUỐI MÔN - YÊU CẦU 13: CIRCUIT BREAKER / RESILIENCE / FALLBACK]
 * - Lớp Fallback được kích hoạt khi Circuit Breaker phát hiện lỗi liên tiếp hoặc timeout từ Product Service.
 * - Trả về dữ liệu mặc định ("Sản phẩm tạm thời không khả dụng") để tránh làm gián đoạn toàn bộ luồng mua sắm của khách hàng.
 */
@Component
public class ProductClientFallback implements ProductClient {
    @Override
    public Product getProductById(Long productId) {
        Product fallbackProduct = new Product();
        fallbackProduct.setId(productId);
        fallbackProduct.setProductName("Sản phẩm tạm thời không khả dụng");
        fallbackProduct.setPrice(BigDecimal.ZERO);
        return fallbackProduct;
    }
}
