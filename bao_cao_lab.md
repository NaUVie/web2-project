# BÁO CÁO NGHIỆM THU DỰ ÁN MICROSERVICES (LAB 1 - LAB 4)

Dưới đây là bảng tổng hợp trạng thái hoàn thành các yêu cầu trong đồ án để bạn dễ dàng theo dõi và trình bày:

---

## 📊 BẢNG TỔNG HỢP TIẾN ĐỘ & TRẠNG THÁI HOÀN THÀNH

| Lab | Yêu cầu chi tiết | Trạng thái | Chi tiết triển khai & File mã nguồn tương ứng |
| :--- | :--- | :---: | :--- |
| **Lab 1** | 1. Sử dụng OpenFeign hoặc RestTemplate | **ĐÃ CÓ** | Sử dụng OpenFeign (`@FeignClient`) để giao tiếp đồng bộ giữa các service.<br>📂 `order-service/.../feignclient/ProductClient.java` |
| | 2. Gọi API để lấy thông tin sản phẩm và người dùng | **ĐÃ CÓ** | Order Service gọi Product Service & User Service trước khi lưu đơn hàng. |
| | 3. Tra cứu thông tin sản phẩm khi tạo đơn hàng | **ĐÃ CÓ** | API tra cứu thông tin sản phẩm dùng chung.<br>📂 `order-service/.../service/CartServiceImpl.java` |
| | 4. Cung cấp API kiểm tra thông tin khách hàng trước khi mua | **ĐÃ CÓ** | User Service cung cấp API kiểm tra user qua ID/Username.<br>📂 `user-service/.../controller/UserController.java` |
| | 5. Kết quả đặt hàng thể hiện đầy đủ (Sản phẩm, Người dùng, Số lượng, Tổng tiền) | **ĐÃ CÓ** | Dữ liệu trả về từ API đặt hàng chứa đầy đủ chi tiết DTO.<br>📂 `order-service/.../domain/Order.java` |
| | 6. Sử dụng RabbitMQ hoặc Kafka xử lý tác vụ bất đồng bộ | **ĐÃ CÓ** | Sử dụng **Kafka** để đồng bộ giỏ hàng, thông tin profile và trừ tồn kho.<br>📂 `docker-compose.yml` (Service `kafka` & `zookeeper`) |
| **Lab 2** | 1. Khi giao hàng thành công (DELIVERED) thì cập nhật giảm kho (Saga Pattern) | **ĐÃ CÓ** | Tự động hóa ở backend: Đơn hàng thành công bắn event qua Kafka để Product Service cập nhật trừ tồn kho trong DB.<br>📂 `OrderEventConsumer.java` & `OrderController.java` |
| | 2. Khi khách hàng đổi SĐT mặc định, xử lý thông tin đơn hàng thế nào? | **ĐÃ CÓ** | Lắng nghe event thay đổi profile, **giữ nguyên** thông tin SĐT và địa chỉ của các đơn hàng cũ để bảo toàn lịch sử giao dịch.<br>📂 `UserProfileUpdatedConsumer.java` |
| | 3. Thống kê doanh thu như thế nào? | **ĐÃ CÓ** | API tính tổng doanh thu từ các đơn hàng thành công và đếm số lượng đơn hàng theo trạng thái.<br>📂 `OrderServiceImpl.java` (hàm `getRevenueStatistics`) |
| | 4. Thông báo hệ thống cho admin | **ĐÃ CÓ** | Sử dụng `EmailService` hỗ trợ gửi mail qua SMTP để thông báo cho người dùng/admin.<br>📂 `EmailService.java` (trong `user-service`) |
| | 5. Sử dụng Redis và MongoDB giải quyết vấn đề | **REDIS (ĐÃ CÓ)**<br>**MONGO (KHÔNG DÙNG)** | *Redis:* Dùng lưu trữ Refresh Token (Auth Service) và Giỏ hàng tạm thời (Order Service).<br>*MongoDB:* Không tích hợp (đã đáp ứng đầy đủ bằng CSDL NoSQL Redis). |
| **Lab 3** | 1. Đăng ký user mới, password được mã hóa | **ĐÃ CÓ** | Sử dụng `BCryptPasswordEncoder` để băm mật khẩu.<br>📂 `user-service/.../controller/AuthController.java` |
| | 2. Đăng nhập đúng cấp Access Token & Refresh Token | **ĐÃ CÓ** | JWT token được sinh ra với cơ chế Refresh token lưu trữ trên Redis.<br>📂 `AuthController.java` |
| | 3. Gọi API không có token hoặc sai password bị từ chối | **ĐÃ CÓ** | Trả về `401 Unauthorized` và chặn request tại API Gateway.<br>📂 `api-gateway/.../filter/JwtAuthenticationFilter.java` |
| | 4. Phân quyền USER và ADMIN | **ĐÃ CÓ** | Chặn quyền thêm sản phẩm đối với USER thường (`403 Forbidden`). Chỉ ADMIN mới có quyền quản trị.<br>📂 `product-catalog-service/.../controller/ProductController.java` |
| | 5. Quyền sở hữu dữ liệu đơn hàng (Ownership) | **ĐÃ CÓ** | Kiểm tra `userId` từ JWT token. User A không thể xem/sửa đơn của User B.<br>📂 `OrderController.java` (hàm check ownership) |
| | 6. Sử dụng Swagger hoặc Postman để kiểm tra bảo mật | **ĐÃ CÓ** | Tích hợp OpenAPI / Swagger UI đầy đủ cho các microservices. |
| **Lab 4** | 1. Dockerize Eureka Server và API Gateway | **ĐÃ CÓ** | Viết Dockerfile riêng và chạy ổn định.<br>📂 `eureka-server/Dockerfile` & `api-gateway/Dockerfile` |
| | 2. Viết docker-compose.yml chạy tối thiểu 5 container | **ĐÃ CÓ** | Chạy tổng cộng **13 containers** cùng lúc (Eureka, Gateway, 6 Backend services, Frontend, Redis, Kafka, Zookeeper, MySQL). |
| | 3. Sử dụng Docker Volume cho database | **ĐÃ CÓ** | Tạo named volume `mysql-data` để đảm bảo dữ liệu bền vững.<br>📂 `docker-compose.yml` (dòng khai báo `volumes`) |
| | 4. Thêm Spring Boot Actuator | **ĐÃ CÓ** | Expose endpoint `/actuator/health` và `/actuator/metrics`. |
| | 5. Thêm Circuit Breaker Resilience4j khi gọi Product | **ĐÃ CÓ** | Cấu hình Circuit Breaker trên Feign Client của `order-service`. Nếu Catalog Service bị dừng, fallback sẽ tự kích hoạt hiển thị thông tin thay thế.<br>📂 `ProductClientFallback.java` |

---

## 🛠️ HƯỚNG DẪN KHỞI CHẠY VÀ KIỂM TRA HỆ THỐNG

### 1. Khởi chạy toàn bộ hệ thống bằng Docker Compose
Mở Terminal tại thư mục gốc dự án và chạy:
```bash
docker compose up -d --build
```
Kiểm tra trạng thái các container:
```bash
docker compose ps
```

### 2. Kiểm tra tính năng lỗi (Circuit Breaker)
1. Thử dừng container catalog:
   ```bash
   docker stop product-catalog-service
   ```
2. Thực hiện gọi API lấy đơn hàng hoặc tạo đơn hàng từ frontend.
3. Hệ thống sẽ kích hoạt Fallback và hiển thị tên sản phẩm là: `"Sản phẩm tạm thời không khả dụng"` thay vì ném ra lỗi `500` hoặc làm sập UI.

### 3. Kiểm tra Actuator Health
Truy cập các đường dẫn sau từ trình duyệt hoặc Postman để kiểm tra sức khỏe của dịch vụ:
* Eureka Server Dashboard: `http://localhost:8761`
* Health check của Catalog Service: `http://localhost:8900/api/catalog/actuator/health`
* Health check của Order Service: `http://localhost:8900/api/shop/actuator/health`
