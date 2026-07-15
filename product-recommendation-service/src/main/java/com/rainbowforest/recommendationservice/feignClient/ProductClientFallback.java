package com.rainbowforest.recommendationservice.feignClient;

import org.springframework.stereotype.Component;
import com.rainbowforest.recommendationservice.model.Product;

@Component
public class ProductClientFallback implements ProductClient {
    @Override
    public Product getProductById(Long productId) {
        Product fallbackProduct = new Product();
        fallbackProduct.setProductName("Sản phẩm tạm thời không khả dụng");
        return fallbackProduct;
    }
}
