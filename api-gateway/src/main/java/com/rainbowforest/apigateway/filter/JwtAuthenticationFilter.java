package com.rainbowforest.apigateway.filter;

import com.rainbowforest.apigateway.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        // 1. Bypass public paths
        if (path.equals("/api/accounts/login") || 
            path.equals("/api/accounts/registration") ||
            path.equals("/api/accounts/users/check-username") ||
            path.equals("/api/accounts/users/check-email") ||
            path.equals("/api/shop/orders/payment-confirm") ||
            path.startsWith("/api/chatbot") ||
            (path.startsWith("/api/catalog") && method.equalsIgnoreCase("GET")) ||
            (path.startsWith("/api/review") && method.equalsIgnoreCase("GET"))) {
            return chain.filter(exchange);
        }

        // 2. Validate token for protected paths
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        // 3. Extract claims and verify roles if needed
        Claims claims = jwtUtil.getClaims(token);
        String username = claims.getSubject();
        String role = claims.get("role", String.class);
        Long userId = claims.get("userId", Long.class);

        // Check Admin Role for administrative endpoints
        // E.g. POST/PUT/DELETE to catalog (products management)
        // E.g. GET/POST/PUT/DELETE to users (users management)
        if ((path.startsWith("/api/catalog") && !method.equalsIgnoreCase("GET")) ||
            (path.startsWith("/api/accounts/users"))) {
            if (role == null || !role.equals("ROLE_ADMIN")) {
                return onError(exchange, HttpStatus.FORBIDDEN);
            }
        }

        // 4. Mutate request to forward custom headers
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", String.valueOf(userId))
                .header("X-User-Username", username)
                .header("X-User-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
