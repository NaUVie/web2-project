package com.rainbowforest.recommendationservice.feignClient;

import org.springframework.stereotype.Component;
import com.rainbowforest.recommendationservice.model.User;

@Component
public class UserClientFallback implements UserClient {
    @Override
    public User getUserById(Long id) {
        User fallbackUser = new User();
        fallbackUser.setUserName("Fallback User (User Service offline)");
        return fallbackUser;
    }
}
