package com.rainbowforest.orderservice.feignclient;

import org.springframework.stereotype.Component;
import com.rainbowforest.orderservice.domain.User;

@Component
public class UserClientFallback implements UserClient {
    @Override
    public User getUserById(Long id) {
        User fallbackUser = new User();
        fallbackUser.setId(id);
        fallbackUser.setUserName("Fallback User (User Service offline)");
        return fallbackUser;
    }
}
