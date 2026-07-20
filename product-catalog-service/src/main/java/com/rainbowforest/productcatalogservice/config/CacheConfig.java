package com.rainbowforest.productcatalogservice.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
 * thông qua {@code @CacheEvict} trong {@link com.rainbowforest.productcatalogservice.service.ProductServiceImpl}.</p>
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.registerModule(new JavaTimeModule());
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Bật default typing để deserialize đúng Type của generic/polymorphic classes.
        // Đồng thời sử dụng custom TypeResolverBuilder để chuyển đổi tên class của Hibernate Collections (PersistentBag, v.v.)
        // thành các Java Collection standard (ArrayList, HashSet, HashMap) để tránh lỗi deserialization.
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build();
        ObjectMapper.DefaultTypeResolverBuilder typer = new ObjectMapper.DefaultTypeResolverBuilder(
                ObjectMapper.DefaultTyping.NON_FINAL, ptv) {
            @Override
            protected com.fasterxml.jackson.databind.jsontype.TypeIdResolver idResolver(
                    com.fasterxml.jackson.databind.cfg.MapperConfig<?> config,
                    com.fasterxml.jackson.databind.JavaType baseType,
                    com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator subtypeValidator,
                    java.util.Collection<com.fasterxml.jackson.databind.jsontype.NamedType> subtypes,
                    boolean forSer, boolean forDeser) {
                return new com.fasterxml.jackson.databind.jsontype.impl.ClassNameIdResolver(baseType, config.getTypeFactory(), subtypeValidator) {
                    @Override
                    public String idFromValue(Object value) {
                        if (value != null && value.getClass().getName().startsWith("org.hibernate.collection")) {
                            if (value instanceof java.util.Set) {
                                return java.util.HashSet.class.getName();
                            } else if (value instanceof java.util.Map) {
                                return java.util.HashMap.class.getName();
                            } else {
                                return java.util.ArrayList.class.getName();
                            }
                        }
                        return super.idFromValue(value);
                    }

                    @Override
                    public String idFromValueAndType(Object value, Class<?> suggestedType) {
                        if (suggestedType != null && suggestedType.getName().startsWith("org.hibernate.collection")) {
                            if (java.util.Set.class.isAssignableFrom(suggestedType)) {
                                return java.util.HashSet.class.getName();
                            } else if (java.util.Map.class.isAssignableFrom(suggestedType)) {
                                return java.util.HashMap.class.getName();
                            } else {
                                return java.util.ArrayList.class.getName();
                            }
                        }
                        return super.idFromValueAndType(value, suggestedType);
                    }
                };
            }
        };
        typer.init(JsonTypeInfo.Id.CLASS, null);
        typer.inclusion(JsonTypeInfo.As.PROPERTY);
        typer.typeProperty("@class");
        om.setDefaultTyping(typer);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(om);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(serializer)
                )
                .disableCachingNullValues();

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
