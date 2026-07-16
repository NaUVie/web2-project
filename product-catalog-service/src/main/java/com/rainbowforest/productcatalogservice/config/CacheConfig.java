package com.rainbowforest.productcatalogservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

/**
 * Cấu hình Redis Cache cho product-catalog-service.
 *
 * <p>Cache hierarchy:</p>
 * <ul>
 *   <li><b>products</b>      – toàn bộ danh sách sản phẩm, TTL 5 phút</li>
 *   <li><b>product</b>       – sản phẩm theo ID, TTL 10 phút</li>
 *   <li><b>productsByCategory</b> – sản phẩm theo danh mục, TTL 5 phút</li>
 * </ul>
 *
 * <p>Khi admin thêm/cập nhật/xóa sản phẩm, cache liên quan bị xóa
 * thông qua {@code @CacheEvict} trong {@link ProductServiceImpl}.</p>
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        // Cấu hình mặc định: serialize value sang JSON, TTL 5 phút
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .disableCachingNullValues(); // không cache giá trị null

        // TTL riêng cho từng cache
        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "products",            defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "product",             defaultConfig.entryTtl(Duration.ofMinutes(10)),
                "productsByCategory",  defaultConfig.entryTtl(Duration.ofMinutes(5))
        );

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
