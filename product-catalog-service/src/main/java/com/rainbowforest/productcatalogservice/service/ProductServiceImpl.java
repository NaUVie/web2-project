package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Lấy toàn bộ sản phẩm.
     * Cache key: "products::all", TTL 5 phút.
     * Cache sẽ bị xóa khi thêm/xóa sản phẩm.
     */
    @Override
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProduct() {
        log.info("[Cache MISS] Loading all products from database");
        return productRepository.findAll();
    }

    /**
     * Lấy sản phẩm theo danh mục.
     * Cache key: "productsByCategory::{category}", TTL 5 phút.
     */
    @Override
    @Cacheable(value = "productsByCategory", key = "#category")
    public List<Product> getAllProductByCategory(String category) {
        log.info("[Cache MISS] Loading products for category='{}' from database", category);
        return productRepository.findAllByCategory(category);
    }

    /**
     * Lấy sản phẩm theo ID.
     * Cache key: "product::{id}", TTL 10 phút.
     */
    @Override
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(Long id) {
        log.info("[Cache MISS] Loading product id={} from database", id);
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        return productRepository.findAllByProductName(name);
    }

    /**
     * Tìm kiếm và lọc sản phẩm kết hợp.
     * Cache key: "products::{categories, name}", TTL 5 phút.
     */
    @Override
    @Cacheable(value = "products", key = "{#categories, #name}")
    public List<Product> searchProducts(List<String> categories, String name) {
        log.info("[Cache MISS] Searching products for categories='{}', name='{}' from database", categories, name);
        String nm = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
        
        List<String> lowerCategories = null;
        boolean hasCategories = false;
        if (categories != null && !categories.isEmpty()) {
            lowerCategories = categories.stream()
                .filter(c -> c != null && !c.trim().isEmpty() && !c.equalsIgnoreCase("All"))
                .map(c -> c.trim().toLowerCase())
                .collect(java.util.stream.Collectors.toList());
            if (!lowerCategories.isEmpty()) {
                hasCategories = true;
            }
        }
        
        return productRepository.searchProducts(lowerCategories, hasCategories, nm);
    }

    /**
     * Thêm sản phẩm mới → xóa cache danh sách và cache theo category để
     * lần GET tiếp theo phản ánh dữ liệu mới nhất.
     */
    @Override
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "productsByCategory", allEntries = true)
    })
    public Product addProduct(Product product) {
        log.info("[Cache EVICT] Product added/updated — clearing products & productsByCategory caches");
        return productRepository.save(product);
    }

    /**
     * Xóa sản phẩm → xóa cache theo ID, danh sách, và theo category.
     */
    @Override
    @Caching(evict = {
            @CacheEvict(value = "product", key = "#productId"),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "productsByCategory", allEntries = true)
    })
    public void deleteProduct(Long productId) {
        log.info("[Cache EVICT] Product id={} deleted — clearing all related caches", productId);
        productRepository.deleteById(productId);
    }
}
