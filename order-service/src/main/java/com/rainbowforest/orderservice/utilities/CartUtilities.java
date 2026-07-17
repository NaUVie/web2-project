package com.rainbowforest.orderservice.utilities;

import java.math.BigDecimal;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.ProductVariantDto;

public class CartUtilities {

    public static BigDecimal getSubTotalForItem(Product product, int quantity){
        BigDecimal priceToUse = product.getPrice();
        if (product.getPromoPrice() != null && product.getPromoPrice().compareTo(BigDecimal.ZERO) > 0) {
            priceToUse = product.getPromoPrice();
        }
        return priceToUse.multiply(BigDecimal.valueOf(quantity));
    }

    public static BigDecimal getSubTotalForItem(Product product, int quantity, String color, String size){
        BigDecimal priceToUse = product.getPrice();
        if (product.getPromoPrice() != null && product.getPromoPrice().compareTo(BigDecimal.ZERO) > 0) {
            priceToUse = product.getPromoPrice();
        }

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            for (ProductVariantDto v : product.getVariants()) {
                boolean colorMatch = (color == null && v.getColor() == null) || (color != null && color.equalsIgnoreCase(v.getColor()));
                boolean sizeMatch = (size == null && v.getSize() == null) || (size != null && size.equalsIgnoreCase(v.getSize()));
                if (colorMatch && sizeMatch) {
                    if (v.getPrice() != null && v.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                        priceToUse = v.getPrice();
                    }
                    break;
                }
            }
        }

        return priceToUse.multiply(BigDecimal.valueOf(quantity));
    }
}
