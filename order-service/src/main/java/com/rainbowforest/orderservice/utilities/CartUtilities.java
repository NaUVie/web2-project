package com.rainbowforest.orderservice.utilities;

import java.math.BigDecimal;

import com.rainbowforest.orderservice.domain.Product;

public class CartUtilities {

    public static BigDecimal getSubTotalForItem(Product product, int quantity){
        BigDecimal priceToUse = product.getPrice();
        if (product.getPromoPrice() != null && product.getPromoPrice().compareTo(BigDecimal.ZERO) > 0) {
            priceToUse = product.getPromoPrice();
        }
        return priceToUse.multiply(BigDecimal.valueOf(quantity));
    }
}
