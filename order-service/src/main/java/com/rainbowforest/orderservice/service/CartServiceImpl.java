package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.redis.CartRedisRepository;
import com.rainbowforest.orderservice.utilities.CartUtilities;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    private boolean matchItem(Item item, Long productId, String color, String size) {
        if (!item.getProduct().getId().equals(productId)) {
            return false;
        }
        boolean colorMatch = (color == null && item.getColor() == null) || 
                             (color != null && color.equalsIgnoreCase(item.getColor()));
        boolean sizeMatch = (size == null && item.getSize() == null) || 
                            (size != null && size.equalsIgnoreCase(item.getSize()));
        return colorMatch && sizeMatch;
    }

    @Override
    @CircuitBreaker(name = "productService", fallbackMethod = "addItemToCartFallback")
    public void addItemToCart(String cartId, Long productId, Integer quantity, String color, String size) {
        log.info("[CartService] Fetching product id={} from product-catalog-service", productId);
        Product product = productClient.getProductById(productId);
        Item item = new Item(quantity, product, CartUtilities.getSubTotalForItem(product, quantity, color, size), color, size);
        cartRedisRepository.addItemToCart(cartId, item);
        log.info("[CartService] Added product id={} (variant: color={}, size={}) to cart id={}", productId, color, size, cartId);
    }

    public void addItemToCartFallback(String cartId, Long productId, Integer quantity, String color, String size, Throwable t) {
        log.error("[CircuitBreaker] product-catalog-service unavailable. cartId={}, productId={}, reason={}",
                cartId, productId, t.getMessage());
        throw new RuntimeException("Dịch vụ sản phẩm tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @Override
    public List<Object> getCart(String cartId) {
        return (List<Object>)cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity, String color, String size) {
        List<Item> cart = (List)cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if(matchItem(item, productId, color, size)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
                item.setQuantity(quantity);
                item.setSubTotal(CartUtilities.getSubTotalForItem(item.getProduct(), quantity, color, size));
                cartRedisRepository.addItemToCart(cartId, item);
                break;
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId, String color, String size) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if(matchItem(item, productId, color, size)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
                break;
            }
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId, String color, String size) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if(matchItem(item, productId, color, size)){
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        List<Item> items = (List)cartRedisRepository.getCart(cartId, Item.class);
        return items;
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }
}
