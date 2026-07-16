package com.rainbowforest.recommendationservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            // Forward Authorization header (JWT Token)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
            
            // Also forward Gateway user identity headers if present
            String userId = request.getHeader("X-User-Id");
            if (userId != null) {
                template.header("X-User-Id", userId);
            }
            String username = request.getHeader("X-User-Username");
            if (username != null) {
                template.header("X-User-Username", username);
            }
            String userRole = request.getHeader("X-User-Role");
            if (userRole != null) {
                template.header("X-User-Role", userRole);
            }
        }
    }
}
