package com.rainbowforest.productcatalogservice.config;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setProductName("MacBook Pro M3 Max");
            p1.setPrice(new BigDecimal("2499.00"));
            p1.setDiscription("Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB Unified Memory, 1TB SSD storage.");
            p1.setCategory("Electronics");
            p1.setAvailability(10);
            p1.setImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60");

            Product p2 = new Product();
            p2.setProductName("iPhone 15 Pro");
            p2.setPrice(new BigDecimal("999.00"));
            p2.setDiscription("Titanium design, A17 Pro chip, customizable Action button, and a powerful 3x Telephoto camera.");
            p2.setCategory("Electronics");
            p2.setAvailability(25);
            p2.setImageUrl("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60");

            Product p3 = new Product();
            p3.setProductName("Sony WH-1000XM5");
            p3.setPrice(new BigDecimal("349.99"));
            p3.setDiscription("Industry leading wireless noise cancelling headphones with Auto NC Optimizer, crystal clear hands-free calling.");
            p3.setCategory("Audio");
            p3.setAvailability(15);
            p3.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60");

            Product p4 = new Product();
            p4.setProductName("Nike Air Max 270");
            p4.setPrice(new BigDecimal("150.00"));
            p4.setDiscription("Nike's first lifestyle Air Max brings you style, comfort and big attitude. Features a large Air unit.");
            p4.setCategory("Footwear");
            p4.setAvailability(30);
            p4.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60");

            Product p5 = new Product();
            p5.setProductName("Mechanical Keyboard GMMK 2");
            p5.setPrice(new BigDecimal("119.99"));
            p5.setDiscription("Custom compact mechanical keyboard, hot-swappable switches, linear Fox switches, aluminum top frame.");
            p5.setCategory("Accessories");
            p5.setAvailability(40);
            p5.setImageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60");

            Product p6 = new Product();
            p6.setProductName("UltraWide Gaming Monitor 34\"");
            p6.setPrice(new BigDecimal("499.99"));
            p6.setDiscription("34-inch curved gaming monitor, 144Hz refresh rate, 1ms response time, HDR10 support, and AMD FreeSync Premium.");
            p6.setCategory("Electronics");
            p6.setAvailability(8);
            p6.setImageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
            System.out.println("======> Database Seeder: Successfully seeded " + productRepository.count() + " products.");
        }
    }
}
