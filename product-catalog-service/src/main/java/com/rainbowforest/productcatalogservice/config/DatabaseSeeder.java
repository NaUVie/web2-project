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
        // Clear all existing data to ensure a fresh, clean seeding
        productVariantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        blogCategoryRepository.deleteAll();
        blogPostRepository.deleteAll();
        advertisementRepository.deleteAll();
        System.out.println("======> Cleared old data for fresh seeding.");

        // 1. Seed Categories
        Category catLaptops = categoryRepository.save(new Category("Laptops & Máy tính", "laptops-computers"));
        Category catPhones = categoryRepository.save(new Category("Điện thoại & Tablet", "phones-tablets"));
        Category catAudio = categoryRepository.save(new Category("Thiết bị âm thanh", "audio-devices"));
        Category catKeyboards = categoryRepository.save(new Category("Bàn phím & Phụ kiện", "keyboards-accessories"));
        Category catControllers = categoryRepository.save(new Category("Tay cầm chơi game", "game-controllers"));
        Category catSneakers = categoryRepository.save(new Category("Giày thể thao", "sneakers"));
        System.out.println("======> Seeded new categories.");

        // 2. Seed Blog Categories
        BlogCategory bcat1 = blogCategoryRepository.save(new BlogCategory("Tin Tức Công Nghệ", "tech-news"));
        BlogCategory bcat2 = blogCategoryRepository.save(new BlogCategory("Hướng Dẫn Mua Sắm", "guides"));
        System.out.println("======> Seeded blog categories.");

        // 3. Seed Blog Posts
        BlogPost post1 = new BlogPost();
        post1.setTitle("Tương lai của vi xử lý Apple M3 Max trên máy tính xách tay");
        post1.setContent("Với việc phát hành bộ vi xử lý Apple M3 Max, máy tính xách tay đã có một bước nhảy vọt về hiệu suất đồ họa và tính toán. Người dùng hiện có thể chỉnh sửa video 8K và huấn luyện các mô hình học máy nhỏ trên một máy di động mà không làm giảm thời lượng pin. Trong bài viết này, chúng tôi xem xét các thay đổi về kiến trúc GPU và bộ nhớ hợp nhất.");
        post1.setCoverImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
        post1.setCategoryName("Tin Tức Công Nghệ");

        BlogPost post2 = new BlogPost();
        post2.setTitle("Cách chọn Tai nghe Chống ồn Không dây Tốt nhất năm 2026");
        post2.setContent("Tai nghe chống ồn không dây là thiết bị không thể thiếu đối với những người làm việc từ xa và khách du lịch. Giữa Sony, Bose và Apple, sự cạnh tranh khốc liệt hơn bao giờ hết. Hướng dẫn mua sắm của chúng tôi bao gồm các chỉ số chính như độ sâu chống ồn chủ động (ANC), chất âm đặc trưng, chất lượng micrô và tính năng chuyển đổi thiết bị thông minh.");
        post2.setCoverImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");
        post2.setCategoryName("Hướng Dẫn Mua Sắm");

        blogPostRepository.saveAll(Arrays.asList(post1, post2));
        System.out.println("======> Seeded blog posts.");

        // 4. Seed Banners
        Advertisement banner1 = new Advertisement();
        banner1.setTitle("Siêu Phẩm Công Nghệ - Giá Sốc Hè 2026");
        banner1.setImageUrl("https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&auto=format&fit=crop&q=80");
        banner1.setTargetUrl("/shop?category=Laptops %26 M%C3%A1y t%C3%ADnh");
        banner1.setActive(true);

        Advertisement banner2 = new Advertisement();
        banner2.setTitle("Thiết Bị Âm Thanh Đỉnh Cao - Giảm Đến 30%");
        banner2.setImageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80");
        banner2.setTargetUrl("/shop?category=Thi%E1%BA%BFt b%E1%BB%8B %C3%A2m thanh");
        banner2.setActive(true);

        Advertisement banner3 = new Advertisement();
        banner3.setTitle("Thời Trang Giày Thể Thao Mới Nhất");
        banner3.setImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80");
        banner3.setTargetUrl("/shop?category=Gi%E1%BA%A3y th%E1%BB%83 thao");
        banner3.setActive(true);

        advertisementRepository.saveAll(Arrays.asList(banner1, banner2, banner3));
        System.out.println("======> Seeded advertisement banners.");

        // 5. Seed Products and Variants
        // Laptops & Máy tính
        Product lap1 = seedProduct("MacBook Pro M3 Max", "60000000", "55000000",
                "Apple M3 Max chip với 16-core CPU và 40-core GPU, màn hình Liquid Retina XDR sắc nét vượt trội, thiết kế sang trọng đẳng cấp.",
                "Laptops & Máy tính", 15, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap1, "Space Black", "36GB RAM / 1TB SSD", "60000000", 5, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap1, "Space Black", "48GB RAM / 1TB SSD", "66000000", 3, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap1, "Silver", "36GB RAM / 1TB SSD", "60000000", 4, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap1, "Silver", "48GB RAM / 1TB SSD", "66000000", 3, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60");

        Product lap2 = seedProduct("ASUS ROG Strix G16", "42000000", "39500000",
                "Laptop Gaming cực đỉnh trang bị vi xử lý Intel Core i9-13980HX, NVIDIA GeForce RTX 4070, màn hình 16-inch 240Hz siêu mượt.",
                "Laptops & Máy tính", 12, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap2, "Eclipse Gray", "16GB RAM / 1TB SSD", "42000000", 7, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60");
        seedVariant(lap2, "Eclipse Gray", "32GB RAM / 1TB SSD", "45500000", 5, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60");

        // Điện thoại & Tablet
        Product ph1 = seedProduct("iPhone 15 Pro Max", "30000000", "28500000",
                "Thiết kế khung viền Titanium siêu bền nhẹ, trang bị chip A17 Pro mạnh mẽ, nút Action tùy biến và hệ thống camera zoom quang học 5x.",
                "Điện thoại & Tablet", 35, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph1, "Titan Tự Nhiên", "256GB", "30000000", 12, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph1, "Titan Tự Nhiên", "512GB", "35000000", 8, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph1, "Titan Đen", "256GB", "30000000", 10, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph1, "Titan Đen", "512GB", "35000000", 5, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60");

        Product ph2 = seedProduct("Samsung Galaxy S24 Ultra", "32000000", "29000000",
                "Điện thoại thông minh Android tích hợp AI thế hệ mới, camera 200MP zoom siêu phân giải, bút S-Pen ghi chú thông minh và viền Titanium bền bỉ.",
                "Điện thoại & Tablet", 25, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph2, "Xám Titanium", "256GB", "32000000", 10, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph2, "Xám Titanium", "512GB", "36000000", 5, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph2, "Đen Titanium", "256GB", "32000000", 10, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60");

        Product ph3 = seedProduct("iPad Pro M4 OLED", "28000000", "26900000",
                "Máy tính bảng iPad Pro mỏng nhất của Apple, sử dụng màn hình Tandem OLED rực rỡ và vi xử lý Apple M4 hiệu suất khủng.",
                "Điện thoại & Tablet", 20, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph3, "Xám Không Gian", "11 inch - 256GB", "28000000", 10, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph3, "Xám Không Gian", "13 inch - 256GB", "34500000", 5, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60");
        seedVariant(ph3, "Bạc (Silver)", "11 inch - 256GB", "28000000", 5, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60");

        // Thiết bị âm thanh
        Product au1 = seedProduct("Sony WH-1000XM5", "8500000", "7900000",
                "Tai nghe chụp tai không dây chống ồn chủ động cao cấp số 1 thị trường, thời lượng pin sử dụng lên đến 30 giờ liên tục.",
                "Thiết bị âm thanh", 30, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");
        seedVariant(au1, "Đen (Black)", null, "8500000", 15, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");
        seedVariant(au1, "Trắng Bạc (Silver)", null, "8500000", 10, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");
        seedVariant(au1, "Xanh Navy (Midnight Blue)", null, "8900000", 5, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60");

        Product au2 = seedProduct("Marshall Acton III", "7500000", "6800000",
                "Loa Bluetooth gia đình mang thiết kế cổ điển sang trọng, chất âm chi tiết sống động, hỗ trợ cổng cắm 3.5mm linh hoạt.",
                "Thiết bị âm thanh", 15, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=60");
        seedVariant(au2, "Đen (Black)", null, "7500000", 8, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=60");
        seedVariant(au2, "Kem (Cream)", null, "7500000", 5, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=60");
        seedVariant(au2, "Nâu (Brown)", null, "7800000", 2, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=60");

        // Bàn phím & Phụ kiện
        Product ac1 = seedProduct("Mechanical Keyboard GMMK 2", "2800000", "2500000",
                "Bàn phím cơ Custom cao cấp từ Glorious, tính năng Hot-swap thay nóng switch, switch Fox Linear bấm mượt mà và khung nhôm sang xịn.",
                "Bàn phím & Phụ kiện", 45, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac1, "Đen (Black)", "Compact 65%", "2800000", 15, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac1, "Đen (Black)", "Full Size 96%", "3200000", 10, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac1, "Trắng (White)", "Compact 65%", "2800000", 12, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac1, "Trắng (White)", "Full Size 96%", "3200000", 8, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60");

        Product ac2 = seedProduct("Logitech MX Master 3S", "3000000", "2600000",
                "Chuột văn phòng và đồ họa công thái học cao cấp nhất của Logitech, mắt đọc 8K DPI cực chuẩn xác và cuộn siêu tốc MagSpeed.",
                "Bàn phím & Phụ kiện", 35, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac2, "Graphite (Đen Xám)", null, "3000000", 20, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60");
        seedVariant(ac2, "Pale Gray (Trắng Xám)", null, "3000000", 15, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60");

        // Tay cầm chơi game
        Product ctrl1 = seedProduct("Sony DualSense Wireless Controller", "1700000", "1550000",
                "Tay cầm chơi game không dây DualSense của Sony PlayStation 5, cảm giác rung phản hồi Haptic Feedback cực đỉnh và Adaptive Triggers.",
                "Tay cầm chơi game", 40, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ctrl1, "Trắng (White)", null, "1700000", 15, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ctrl1, "Đen (Black)", null, "1700000", 15, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60");
        seedVariant(ctrl1, "Đỏ Cosmic (Cosmic Red)", null, "1800000", 10, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60");

        Product ctrl2 = seedProduct("Flydigi Apex 4", "3200000", "2890000",
                "Tay cầm chơi game cao cấp bật nhất từ Flydigi với cần xoay Force Feedback cơ học tùy chỉnh lực cản độc đáo và màn hình LED hiển thị sinh động.",
                "Tay cầm chơi game", 20, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=60");
        seedVariant(ctrl2, "Trắng (White)", null, "3200000", 15, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=60");
        seedVariant(ctrl2, "EVA Limited Edition", null, "3800000", 5, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=60");

        // Giày thể thao
        Product sh1 = seedProduct("Nike Air Max 270", "3500000", "2900000",
                "Đôi giày thể thao năng động tiên phong của Nike với đế khí Air unit cực dày êm ái, kiểu dáng thời thượng bắt mắt.",
                "Giày thể thao", 40, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh1, "Trắng / Đỏ", "40", "3500000", 10, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh1, "Trắng / Đỏ", "41", "3500000", 10, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh1, "Trắng / Đỏ", "42", "3500000", 5, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh1, "Đen / Xanh Dương", "40", "3500000", 10, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh1, "Đen / Xanh Dương", "41", "3500000", 5, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60");

        Product sh2 = seedProduct("Adidas Ultraboost Light", "5000000", "4190000",
                "Dòng giày chạy bộ quốc dân thế hệ mới tối giản hóa trọng lượng đệm, mang lại độ êm vượt trội và khả năng hoàn trả năng lượng hiệu quả.",
                "Giày thể thao", 30, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh2, "Đen Core Black", "40", "5000000", 10, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh2, "Đen Core Black", "41", "5000000", 10, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh2, "Trắng Cloud White", "40", "5000000", 5, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=60");
        seedVariant(sh2, "Trắng Cloud White", "41", "5000000", 5, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=60");

        System.out.println("======> Seeded and updated all products and variants successfully.");
    }

    private Product seedProduct(String name, String price, String promoPrice, String desc, String category, int availability, String imageUrl) {
        Product product = new Product();
        product.setProductName(name);
        product.setPrice(new BigDecimal(price));
        product.setPromoPrice(promoPrice != null ? new BigDecimal(promoPrice) : null);
        product.setDiscription(desc);
        product.setCategory(category);
        product.setAvailability(availability);
        product.setImageUrl(imageUrl);
        return productRepository.save(product);
    }

    private void seedVariant(Product product, String color, String size, String price, int availability, String imageUrl) {
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setColor(color);
        variant.setSize(size);
        variant.setPrice(price != null ? new BigDecimal(price) : null);
        variant.setAvailability(availability);
        variant.setImageUrl(imageUrl);
        productVariantRepository.save(variant);
    }
}
