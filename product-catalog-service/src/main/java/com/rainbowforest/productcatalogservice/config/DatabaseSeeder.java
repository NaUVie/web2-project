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

    @Autowired
    private ProductVariantRepository productVariantRepository;

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
        if (productRepository.count() == 0) {

        // Electronics (6 products)
        seedProduct("MacBook Pro M3 Max", "60000000", "55000000",
                "Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB Unified Memory, 1TB SSD storage.",
                "Electronics", 10, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60");
        seedProduct("iPhone 15 Pro", "25000000", "22000000",
                "Titanium design, A17 Pro chip, customizable Action button, and a powerful 3x Telephoto camera.",
                "Electronics", 25, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60");
        seedProduct("UltraWide Gaming Monitor 34\"", "12000000", "10500000",
                "34-inch curved gaming monitor, 144Hz refresh rate, 1ms response time, HDR10 support, and AMD FreeSync Premium.",
                "Electronics", 8, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60");
        seedProduct("iPad Pro M4", "28000000", "26500000",
                "Siêu mỏng nhẹ, màn hình OLED Tandem đột phá, chip Apple M4 cực khủng cho hiệu năng xử lý đồ họa chuyên nghiệp.",
                "Electronics", 15, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60");
        seedProduct("ASUS ROG Ally X", "23000000", "21900000",
                "Máy chơi game cầm tay chạy Windows tốt nhất thế giới, trang bị chip AMD Ryzen Z1 Extreme, dung lượng pin tăng gấp đôi.",
                "Electronics", 12, "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500&auto=format&fit=crop&q=60");
        seedProduct("Samsung Galaxy S24 Ultra", "30000000", "27000000",
                "Điện thoại Android cao cấp nhất với camera 200MP, khung viền Titanium bền bỉ cùng bút S-Pen đa năng và AI thông minh.",
                "Electronics", 20, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60");

        // Audio (5 products)
        seedProduct("Sony WH-1000XM5", "8500000", null,
                "Industry leading wireless noise cancelling headphones with Auto NC Optimizer, crystal clear hands-free calling.",
                "Audio", 15, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60");
        seedProduct("AirPods Pro 2", "6000000", "5300000",
                "Tai nghe True Wireless cao cấp của Apple, chống ồn chủ động ANC tốt gấp 2 lần, thời lượng pin tối ưu và hộp sạc tìm kiếm.",
                "Audio", 35, "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=500&auto=format&fit=crop&q=60");
        seedProduct("Marshall Acton III", "7500000", "6800000",
                "Loa Bluetooth gia đình mang thiết kế cổ điển sang trọng, chất âm chi tiết sống động, hỗ trợ cổng cắm 3.5mm linh hoạt.",
                "Audio", 10, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=60");
        seedProduct("JBL Charge 5", "4000000", "3600000",
                "Loa di động kháng nước chống bụi IP67, chất âm Bass sâu trầm uy lực, tích hợp cổng sạc dự phòng cho điện thoại.",
                "Audio", 25, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60");
        seedProduct("Sennheiser Momentum 4", "9500000", "8900000",
                "Tai nghe chụp tai hi-end với chất lượng âm thanh đỉnh cấp, thời lượng pin kỷ lục lên đến 60 giờ nghe nhạc liên tục.",
                "Audio", 8, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60");

        // Footwear (5 products)
        seedProduct("Nike Air Max 270", "3500000", "2800000",
                "Nike's first lifestyle Air Max brings you style, comfort and big attitude. Features a large Air unit.",
                "Footwear", 30, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60");
        seedProduct("Adidas Ultraboost Light", "5000000", "4200000",
                "Giày chạy bộ quốc dân thế hệ mới siêu nhẹ, đệm Boost phản hồi lực cực tốt giúp bảo vệ bàn chân và tối ưu lực chạy.",
                "Footwear", 18, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500&auto=format&fit=crop&q=60");
        seedProduct("Nike Air Jordan 1 Low", "4500000", null,
                "Đôi giày bóng rổ đường phố mang tính biểu tượng mọi thời đại, phối màu cá tính dễ dàng phối với mọi trang phục.",
                "Footwear", 15, "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=500&auto=format&fit=crop&q=60");
        seedProduct("New Balance 550", "3800000", "3400000",
                "Đôi sneaker thời thượng mang cảm hứng retro thập niên 90, chất liệu da cao cấp và kiểu dáng vintage độc đáo.",
                "Footwear", 22, "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=60");
        seedProduct("Puma Palermo Leather", "2800000", "2400000",
                "Thiết kế cổ điển lấy cảm hứng từ các sân cỏ nước Ý, chất liệu da lộn mềm mại cùng màu sắc vintage tinh tế.",
                "Footwear", 14, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=60");

        // Accessories (5 products)
        seedProduct("Mechanical Keyboard GMMK 2", "2800000", null,
                "Custom compact mechanical keyboard, hot-swappable switches, linear Fox switches, aluminum top frame.",
                "Accessories", 40, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60");
        seedProduct("Logitech MX Master 3S", "3000000", "2600000",
                "Chuột văn phòng/đồ họa cao cấp nhất, mắt đọc 8K DPI siêu chính xác trên mọi bề mặt, bánh xe cuộn MagSpeed siêu tốc.",
                "Accessories", 25, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60");
        seedProduct("Elgato Stream Deck MK.2", "4200000", "3900000",
                "Bàn phím điều khiển gồm 15 phím LCD có thể tùy chỉnh tính năng và hình ảnh hiển thị, thiết bị hoàn hảo cho streamer.",
                "Accessories", 12, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60");
        seedProduct("SteelSeries Arena 3", "3900000", "3500000",
                "Hệ thống loa gaming 2.0 mang âm trường rộng mở, tái tạo âm thanh vòm sống động và rõ ràng giúp tối ưu trải nghiệm game.",
                "Accessories", 15, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=60");
        seedProduct("Anker Prime 100W GaN", "1800000", "1500000",
                "Củ sạc công nghệ GaN Prime sạc siêu nhanh công suất 100W nhỏ gọn nhất, có 3 cổng ra sạc đồng thời cho laptop/điện thoại.",
                "Accessories", 50, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60");

        // Tay cầm (6 products)
        seedProduct("Sony DualSense Wireless Controller PS5", "1700000", "1500000",
                "Tay cầm chơi game không dây Sony DualSense cho máy PS5, tích hợp công nghệ phản hồi rung Haptic Feedback và cò nhấn thích ứng Adaptive Triggers.",
                "Tay cầm", 20, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60");
        seedProduct("Sony DualSense Edge Wireless Controller", "5000000", "4700000",
                "Tay cầm chơi game chuyên nghiệp cao cấp nhất của Sony cho PS5/PC. Cho phép thay đổi cần analog, gán nút phụ phía sau lưng, tùy chỉnh hành trình cò nhấn.",
                "Tay cầm", 5, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60");
        seedProduct("Flydigi Apex 4 Wireless Controller", "3200000", "2900000",
                "Tay cầm chơi game đỉnh cao của Flydigi với nút nhấn micro-switch cơ học lực ấn nhẹ, màn hình LED hiển thị thông tin, cần xoay lực phản hồi cơ học Force Feedback độc đáo.",
                "Tay cầm", 15, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=60");
        seedProduct("Flydigi Vader 3 Pro", "1400000", "1200000",
                "Tay cầm chơi game hỗ trợ kết nối đa nền tảng PC/Switch/Android/iOS. Tần số phản hồi 1000Hz, cảm biến Hall Effect Joystick chống trôi, nút bấm cơ học cực nảy.",
                "Tay cầm", 30, "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=500&auto=format&fit=crop&q=60");
        seedProduct("Gamesir G8 Galileo Type-C Mobile Controller", "2000000", "1700000",
                "Tay cầm chơi game chuyên nghiệp dành cho điện thoại iPhone 15 và Android. Thiết kế công thái học ôm tay, cần gạt Hall Effect, cổng sạc Type-C trực tiếp.",
                "Tay cầm", 25, "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=500&auto=format&fit=crop&q=60");
        seedProduct("Gamesir T4 Cyclone Pro", "1200000", "1000000",
                "Tay cầm chơi game không dây hỗ trợ PC, Switch, Android, iOS. Sử dụng nút bấm cơ học, cảm biến Hall Effect Joystick, con quay hồi chuyển 6 trục hỗ trợ ngắm bắn.",
                "Tay cầm", 40, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60");

        System.out.println("======> Seeded and updated all products successfully.");
        }
    }

    private void seedProduct(String name, String price, String promoPrice, String desc, String category, int availability, String imageUrl) {
        Product product = new Product();
        product.setProductName(name);
        product.setPrice(new BigDecimal(price));
        product.setPromoPrice(promoPrice != null ? new BigDecimal(promoPrice) : null);
        product.setDiscription(desc);
        product.setCategory(category);
        product.setAvailability(availability);
        product.setImageUrl(imageUrl);
        Product savedProduct = productRepository.save(product);

        // Add variants for specific items to show on UI
        if ("Sony DualSense Wireless Controller PS5".equals(name)) {
            productVariantRepository.save(new ProductVariant(savedProduct, "Trắng", null, null, 10, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Đen", null, new BigDecimal("1550000"), 5, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=60"));
            productVariantRepository.save(new ProductVariant(savedProduct, "Đỏ Cosmic", null, new BigDecimal("1600000"), 5, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60"));
        } else if ("Nike Air Max 270".equals(name)) {
            productVariantRepository.save(new ProductVariant(savedProduct, "Đỏ", "40", null, 10, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Đỏ", "41", null, 10, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Xanh Dương", "40", null, 5, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Xanh Dương", "42", null, 5, imageUrl));
        } else if ("iPhone 15 Pro".equals(name)) {
            productVariantRepository.save(new ProductVariant(savedProduct, "Titan Tự Nhiên", "128GB", null, 10, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Titan Xanh", "256GB", new BigDecimal("25000000"), 8, imageUrl));
            productVariantRepository.save(new ProductVariant(savedProduct, "Titan Đen", "128GB", null, 7, imageUrl));
        }
    }
}
