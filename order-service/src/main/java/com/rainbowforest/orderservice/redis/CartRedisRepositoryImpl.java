package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            String jsonObject = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().add(key, jsonObject);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        Set<String> members = redisTemplate.opsForSet().members(key);
        if (members != null) {
            for (String smember : members) {
                try {
                    cart.add(objectMapper.readValue(smember, type));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            String itemCart = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().remove(key, itemCart);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteCart(String key) {
        redisTemplate.delete(key);
    }
}
