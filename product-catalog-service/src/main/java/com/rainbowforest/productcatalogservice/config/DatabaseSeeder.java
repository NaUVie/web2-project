package com.rainbowforest.productcatalogservice.config;

import com.rainbowforest.productcatalogservice.entity.*;
import com.rainbowforest.productcatalogservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BlogCategoryRepository blogCategoryRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Categories
        if (categoryRepository.count() == 0) {
            Category cat1 = new Category("Electronics", "electronics");
            Category cat2 = new Category("Audio", "audio");
            Category cat3 = new Category("Footwear", "footwear");
            Category cat4 = new Category("Accessories", "accessories");
            Category cat5 = new Category("Tay cầm", "tay-cam");
            categoryRepository.saveAll(Arrays.asList(cat1, cat2, cat3, cat4, cat5));
            System.out.println("======> Seeded product categories.");
        } else {
            // Ensure Tay cầm category exists
            boolean hasTayCam = categoryRepository.findAll().stream().anyMatch(c -> c.getName().equalsIgnoreCase("Tay cầm"));
            if (!hasTayCam) {
                Category cat5 = new Category("Tay cầm", "tay-cam");
                categoryRepository.save(cat5);
                System.out.println("======> Added missing 'Tay cầm' category.");
            }
        }

        // 2. Seed Blog Categories
        if (blogCategoryRepository.count() == 0) {
            BlogCategory bcat1 = new BlogCategory("Technology News", "tech-news");
            BlogCategory bcat2 = new BlogCategory("Buying Guides", "guides");
            blogCategoryRepository.saveAll(Arrays.asList(bcat1, bcat2));
            System.out.println("======> Seeded blog categories.");
        }

        // 3. Seed Blog Posts
        if (blogPostRepository.count() == 0) {
            BlogPost post1 = new BlogPost();
            post1.setTitle("The Future of Apple M3 Max Laptops");
            post1.setContent("With the release of the Apple M3 Max processor, laptops have taken a giant leap in graphic and compute performance. Users can now edit 8K videos and train small machine learning models on a portable machine without compromising battery life. In this article, we look into the architectural changes in the GPU and unified memory architecture.");
            post1.setCoverImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
            post1.setCategoryName("Technology News");

            BlogPost post2 = new BlogPost();
            post2.setTitle("How to Pick the Best Wireless Noise Cancelling Headphones in 2026");
            post2.setContent("Wireless noise cancelling headphones are essential for remote workers and travelers. Between Sony, Bose, and Apple, the competition is fiercer than ever. Our buying guide covers key metrics like active noise cancellation depth, audio response curves, microphone quality in call environments, and multi-device connection switching.");
            post2.setCoverImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");
            post2.setCategoryName("Buying Guides");

            blogPostRepository.saveAll(Arrays.asList(post1, post2));
            System.out.println("======> Seeded blog posts.");
        }

        // 4. Seed Banners
        if (advertisementRepository.count() == 0) {
            Advertisement banner1 = new Advertisement();
            banner1.setTitle("Siêu Phẩm Công Nghệ - Giá Sốc Hè 2026");
            banner1.setImageUrl("https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&auto=format&fit=crop&q=80");
            banner1.setTargetUrl("/shop?category=Electronics");
            banner1.setActive(true);

            Advertisement banner2 = new Advertisement();
            banner2.setTitle("Thiết Bị Âm Thanh Đỉnh Cao - Giảm Đến 30%");
            banner2.setImageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80");
            banner2.setTargetUrl("/shop?category=Audio");
            banner2.setActive(true);

            Advertisement banner3 = new Advertisement();
            banner3.setTitle("Thời Trang Giày Thể Thao Mới Nhất");
            banner3.setImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80");
            banner3.setTargetUrl("/shop?category=Footwear");
            banner3.setActive(true);

            advertisementRepository.saveAll(Arrays.asList(banner1, banner2, banner3));
            System.out.println("======> Seeded advertisement banners.");
        }

        // 5. Seed Products
        // Clear all products first to force updating to VND prices
        productRepository.deleteAll();

        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setProductName("MacBook Pro M3 Max");
            p1.setPrice(new BigDecimal("60000000"));
            p1.setPromoPrice(new BigDecimal("55000000"));
            p1.setDiscription("Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB Unified Memory, 1TB SSD storage.");
            p1.setCategory("Electronics");
            p1.setAvailability(10);
            p1.setImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60");

            Product p2 = new Product();
            p2.setProductName("iPhone 15 Pro");
            p2.setPrice(new BigDecimal("25000000"));
            p2.setPromoPrice(new BigDecimal("22000000"));
            p2.setDiscription("Titanium design, A17 Pro chip, customizable Action button, and a powerful 3x Telephoto camera.");
            p2.setCategory("Electronics");
            p2.setAvailability(25);
            p2.setImageUrl("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60");

            Product p3 = new Product();
            p3.setProductName("Sony WH-1000XM5");
            p3.setPrice(new BigDecimal("8500000"));
            p3.setPromoPrice(null);
            p3.setDiscription("Industry leading wireless noise cancelling headphones with Auto NC Optimizer, crystal clear hands-free calling.");
            p3.setCategory("Audio");
            p3.setAvailability(15);
            p3.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60");

            Product p4 = new Product();
            p4.setProductName("Nike Air Max 270");
            p4.setPrice(new BigDecimal("3500000"));
            p4.setPromoPrice(new BigDecimal("2800000"));
            p4.setDiscription("Nike's first lifestyle Air Max brings you style, comfort and big attitude. Features a large Air unit.");
            p4.setCategory("Footwear");
            p4.setAvailability(30);
            p4.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60");

            Product p5 = new Product();
            p5.setProductName("Mechanical Keyboard GMMK 2");
            p5.setPrice(new BigDecimal("2800000"));
            p5.setPromoPrice(null);
            p5.setDiscription("Custom compact mechanical keyboard, hot-swappable switches, linear Fox switches, aluminum top frame.");
            p5.setCategory("Accessories");
            p5.setAvailability(40);
            p5.setImageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60");

            Product p6 = new Product();
            p6.setProductName("UltraWide Gaming Monitor 34\"");
            p6.setPrice(new BigDecimal("12000000"));
            p6.setPromoPrice(new BigDecimal("10500000"));
            p6.setDiscription("34-inch curved gaming monitor, 144Hz refresh rate, 1ms response time, HDR10 support, and AMD FreeSync Premium.");
            p6.setCategory("Electronics");
            p6.setAvailability(8);
            p6.setImageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
        }

        // Seed and update gaming controllers from Sony, Flydigi, Gamesir
        updateOrSaveController("Sony DualSense Wireless Controller PS5", "1700000", "1500000",
                "Tay cầm chơi game không dây Sony DualSense cho máy PS5, tích hợp công nghệ phản hồi rung Haptic Feedback và cò nhấn thích ứng Adaptive Triggers.",
                "Tay cầm", 20, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60");

        updateOrSaveController("Sony DualSense Edge Wireless Controller", "5000000", "4700000",
                "Tay cầm chơi game chuyên nghiệp cao cấp nhất của Sony cho PS5/PC. Cho phép thay đổi cần analog, gán nút phụ phía sau lưng, tùy chỉnh hành trình cò nhấn.",
                "Tay cầm", 5, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60");

        updateOrSaveController("Flydigi Apex 4 Wireless Controller", "3200000", "2900000",
                "Tay cầm chơi game đỉnh cao của Flydigi với nút nhấn micro-switch cơ học lực ấn nhẹ, màn hình LED hiển thị thông tin, cần xoay lực phản hồi cơ học Force Feedback độc đáo.",
                "Tay cầm", 15, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=60");

        updateOrSaveController("Flydigi Vader 3 Pro", "1400000", "1200000",
                "Tay cầm chơi game hỗ trợ kết nối đa nền tảng PC/Switch/Android/iOS. Tần số phản hồi 1000Hz, cảm biến Hall Effect Hall Joystick chống trôi, nút bấm cơ học bấm cực nảy.",
                "Tay cầm", 30, "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=500&auto=format&fit=crop&q=60");

        updateOrSaveController("Gamesir G8 Galileo Type-C Mobile Controller", "2000000", "1700000",
                "Tay cầm chơi game chuyên nghiệp dành cho điện thoại iPhone 15 series và Android. Thiết kế công thái học ôm tay, cần gạt Hall Effect, cổng sạc Type-C trực tiếp giảm độ trễ tối đa.",
                "Tay cầm", 25, "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=500&auto=format&fit=crop&q=60");

        updateOrSaveController("Gamesir T4 Cyclone Pro", "1200000", "1000000",
                "Tay cầm chơi game không dây hỗ trợ PC, Switch, Android, iOS. Sử dụng nút bấm cơ học, cảm biến Hall Effect Joystick, con quay hồi chuyển 6 trục hỗ trợ ngắm bắn chính xác.",
                "Tay cầm", 40, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60");

        System.out.println("======> Seeded and updated game controllers.");
    }

    private void updateOrSaveController(String name, String price, String promoPrice, String desc, String category, int availability, String imageUrl) {
        java.util.List<Product> existing = productRepository.findAll().stream()
                .filter(p -> p.getProductName().equalsIgnoreCase(name))
                .collect(java.util.stream.Collectors.toList());
        Product product;
        if (!existing.isEmpty()) {
            product = existing.get(0);
        } else {
            product = new Product();
            product.setProductName(name);
        }
        product.setPrice(new BigDecimal(price));
        product.setPromoPrice(promoPrice != null ? new BigDecimal(promoPrice) : null);
        product.setDiscription(desc);
        product.setCategory(category);
        product.setAvailability(availability);
        product.setImageUrl(imageUrl);
        productRepository.save(product);
    }
}
