package com.rainbowforest.orderservice.feignclient;

import org.springframework.stereotype.Component;
import com.rainbowforest.orderservice.domain.Product;
import java.math.BigDecimal;

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
