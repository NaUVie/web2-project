# BÁO CÁO KIỂM TRA & NGHIỆM THU CHI TIẾT YÊU CẦU DỰ ÁN
**Dự án:** Hệ thống E-Commerce Microservices (Nexus Shop)  
**Tập tin yêu cầu gốc:** [yeucau.md](./yeucau.md)  
**Thời gian kiểm tra:** 16-07-2026

Dưới đây là báo cáo kiểm tra chi tiết từng yêu cầu kỹ thuật của bài Lab 1 đến Lab 4 đối với cơ sở mã nguồn hiện tại của dự án.

---

## 📊 BẢNG TỔNG HỢP TRẠNG THÁI KIỂM TRA

| STT | Lab | Nội dung yêu cầu | Trạng thái | Tập tin & Dòng mã nguồn đối chiếu | Đánh giá kỹ thuật |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | **Lab 1** | Tách Monolithic thành Microservices (Product, Order, User Services) | **ĐÃ XONG** | Toàn bộ cấu trúc thư mục gốc | Đã tách thành các dịch vụ độc lập: `product-catalog-service`, `order-service`, `user-service` với các DB riêng biệt. |
| **2** | **Lab 1** | Sử dụng OpenFeign hoặc RestTemplate | **ĐÃ XONG** | `order-service/src/main/java/.../feignclient/ProductClient.java`<br>`order-service/src/main/java/.../feignclient/UserClient.java` | Sử dụng `@FeignClient` của OpenFeign để thực hiện các cuộc gọi đồng bộ giữa các dịch vụ. |
| **3** | **Lab 1** | Order Service gọi API Product & User Service lấy thông tin | **ĐÃ XONG** | `order-service/src/main/java/.../controller/OrderController.java#L68-L77` | Khi lưu đơn hàng, hệ thống gọi `userClient.getUserById(userId)` và truy xuất chi tiết sản phẩm từ giỏ hàng. |
| **4** | **Lab 1** | Order Service tra cứu thông tin sản phẩm khi tạo đơn hàng | **ĐÃ XONG** | `order-service/src/main/java/.../controller/OrderController.java#L63-L66` | Tra cứu và kiểm tra thông tin các sản phẩm trong giỏ hàng (`CartService`) trước khi khởi tạo đơn hàng. |
| **5** | **Lab 1** | User Service cung cấp API kiểm tra khách hàng trước khi mua | **ĐÃ XONG** | `user-service/src/main/java/.../controller/UserController.java` | Cung cấp endpoint `/users/{id}` để kiểm tra tài khoản người dùng hợp lệ trước khi tạo đơn hàng. |
| **6** | **Lab 1** | Kết quả đặt hàng thể hiện đầy đủ (Sản phẩm, Người dùng, Số lượng, Tổng tiền) | **ĐÃ XONG** | `order-service/src/main/java/.../domain/Order.java` | Class Entity `Order` chứa liên kết `List<Item>` (sản phẩm, số lượng) và `User` cùng trường `total` (tổng tiền). |
| **7** | **Lab 1** | Sử dụng RabbitMQ hoặc Kafka xử lý tác vụ bất đồng bộ sau khi tạo đơn hàng | **ĐÃ XONG** | `order-service/src/main/java/.../kafka/OrderEventProducer.java`<br>`product-catalog-service/src/main/java/.../kafka/OrderEventConsumer.java` | Sử dụng **Kafka** để truyền thông điệp bất đồng bộ. Khi đơn hàng được cập nhật, `OrderEventConsumer` ở Catalog Service nhận thông tin để cập nhật kho hàng. |
| **8** | **Lab 2** | Saga Pattern: Cập nhật giảm số lượng tồn kho khi đơn hàng hoàn thành thành công | **ĐÃ XONG** | `product-catalog-service/src/main/java/.../kafka/OrderEventConsumer.java#L31-L61` | Lắng nghe trạng thái `COMPLETED`/`DELIVERED` của đơn hàng, duyệt qua danh sách sản phẩm và giảm trường `availability` trong database. |
| **9** | **Lab 2** | Đổi số điện thoại mặc định của khách hàng thì đơn hàng cũ xử lý ra sao? | **ĐÃ XONG** | `order-service/src/main/java/.../kafka/UserProfileUpdatedConsumer.java` | Nhận event cập nhật profile nhưng **không ghi đè** lên thông tin checkout cũ (SĐT, địa chỉ) nhằm giữ nguyên lịch sử pháp lý của hóa đơn cũ. |
| **10** | **Lab 2** | Thống kê doanh thu | **ĐÃ XONG** | `order-service/src/main/java/.../service/OrderServiceImpl.java#L63-L91` | API `/orders/statistics/revenue` tính tổng doanh thu từ các đơn hàng thành công, đếm số lượng đơn hàng theo trạng thái. |
| **11** | **Lab 2** | Thông báo hệ thống cho admin | **ĐÃ XONG** | `order-service/src/main/java/.../kafka/OrderCompensationConsumer.java#L39-L51` | Khi giao dịch Saga thất bại (ví dụ thiếu hàng), hệ thống tự động gửi email SMTP cảnh báo trực tiếp cho Admin (`admin@nexusshop.com`). |
| **12** | **Lab 2** | Sử dụng Redis và MongoDB để giải quyết 1 vấn đề | **REDIS (ĐÃ XONG)**<br>**MONGO (KHÔNG DÙNG)** | `user-service/src/main/java/.../controller/AuthController.java#L55` | **Redis**: Dùng lưu trữ Refresh Token và Giỏ hàng tạm thời.  <br>**MongoDB**: Không sử dụng (không cấu hình POM/Database cho MongoDB). |
| **13** | **Lab 3** | Chọn Câu 1: Xây dựng Auth Service với JWT, Refresh Token và Redis | **ĐÃ XONG** | `user-service/src/main/java/.../controller/AuthController.java` | Đã hoàn thành toàn bộ API đăng ký, đăng nhập, refresh-token (lưu trữ Redis) và đăng xuất. |
| **14** | **Lab 3** | Bảo vệ API tại Gateway và các service | **ĐÃ XONG** | `api-gateway/src/main/java/.../filter/JwtAuthenticationFilter.java` | Gateway lọc tất cả các request, chặn request thiếu token (trừ public API), và chuyển tiếp định danh qua header. |
| **15** | **Lab 3** | Kiểm tra quyền sở hữu đơn hàng | **ĐÃ XONG** | `order-service/src/main/java/.../controller/OrderController.java#L173-L175` | Đối chiếu `userId` nhận từ Header `X-User-Id` với chủ của đơn hàng. Chỉ cho phép chính chủ hoặc ADMIN xem/hủy đơn. |
| **16** | **Lab 3** | OpenFeign truyền Token | **ĐÃ XONG** | `order-service/src/main/java/.../config/FeignClientConfig.java` | RequestInterceptor của Feign tự động đính kèm header `Authorization` (Bearer token) cùng các headers định danh. |
| **17** | **Lab 3** | Swagger / OpenAPI & Postman | **ĐÃ XONG** | `api-gateway/src/main/resources/application.yml`<br>`e-commerce-microservices.postman_collection.json` | Tích hợp springdoc-openapi, định cấu hình Swagger UI gom nhóm tài liệu từ các service tại `/swagger-ui.html`. |
| **18** | **Lab 4** | Viết Dockerfile cho Eureka Server và API Gateway | **ĐÃ XONG** | `eureka-server/Dockerfile`<br>`api-gateway/Dockerfile` | Viết Dockerfile hoàn chỉnh đóng gói các dịch vụ thành image trên nền Java 17. |
| **19** | **Lab 4** | Viết compose.yaml chạy tối thiểu 5 container | **ĐÃ XONG** | `docker-compose.yml` | Cấu hình chạy **13 containers** (Eureka, Gateway, 6 backend services, Frontend, Redis, Kafka, Zookeeper, MySQL). |
| **20** | **Lab 4** | Sử dụng Docker Volume cho database | **ĐÃ XONG** | `docker-compose.yml#L175-L177` | Định nghĩa named volume `mysql-data` giúp bảo toàn dữ liệu database khi restart container. |
| **21** | **Lab 4** | Thêm Spring Boot Actuator | **ĐÃ XONG** | `order-service/src/main/resources/application.properties#L34-L35` | Cấu hình exposure include `*` cho phép gọi `/actuator/health` và `/actuator/metrics`. |
| **22** | **Lab 4** | Thêm Circuit Breaker khi Order Service gọi Product Service | **ĐÃ XONG** | `order-service/src/main/java/.../feignclient/ProductClient.java#L9`<br>`order-service/src/main/java/.../feignclient/ProductClientFallback.java` | Cấu hình resilience4j thông qua OpenFeign Circuit Breaker. Khi catalog bị sập, fallback trả về sản phẩm giả lập an toàn thay vì sập hệ thống. |

---

## 🔍 CHI TIẾT ĐỐI CHIẾU CÁC KỊCH BẢN BẢO MẬT (LAB 3 - CÂU 1)

Dưới đây là kết quả kiểm thử các tình huống bảo mật bắt buộc:

| STT | Tình huống kiểm thử | Kết quả mong đợi | Trạng thái thực tế | Cơ chế kiểm soát |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Đăng ký user mới | Thành công, password được mã hóa | **ĐÃ ĐẠT** | Sử dụng `BCryptPasswordEncoder` để mã hóa mật khẩu trước khi lưu database. |
| **2** | Login đúng username/password | Nhận Access Token và Refresh Token | **ĐÃ ĐẠT** | Trả về chuỗi JWT Access Token và Refresh Token dạng UUID trong response. |
| **3** | Login sai password | Không cấp token, trả lỗi | **ĐÃ ĐẠT** | Trả về `401 Unauthorized` kèm message lỗi cụ thể. |
| **4** | Gọi API tạo đơn không có token | 401 Unauthorized | **ĐÃ ĐẠT** | Chặn trực tiếp tại `JwtAuthenticationFilter` ở Gateway. |
| **5** | USER tạo đơn hàng | Thành công | **ĐÃ ĐẠT** | User mang token hợp lệ được quyền lưu đơn hàng bình thường. |
| **6** | USER thêm sản phẩm | 403 Forbidden | **ĐÃ ĐẠT** | Gateway chặn các method sửa đổi (POST/PUT/DELETE) tới `/api/catalog/**` đối với role không phải `ROLE_ADMIN`. |
| **7** | ADMIN thêm sản phẩm | Thành công | **ĐÃ ĐẠT** | Request hợp lệ được chuyển tiếp tới Product Catalog Service và lưu thành công. |
| **8** | User A xem đơn của User B | 403 Forbidden hoặc 404 | **ĐÃ ĐẠT** | Kiểm tra quyền sở hữu đơn hàng (đối chiếu `X-User-Id` từ token với ID chủ sở hữu đơn hàng trong database). |
| **9** | Dùng Refresh Token cấp Access Token mới | Thành công | **ĐÃ ĐẠT** | API `/refresh-token` đối chiếu Redis, nếu hợp lệ sẽ cấp Access Token mới mà không cần đăng nhập lại. |
| **10**| Logout rồi dùng Refresh Token cũ | 401 Unauthorized | **ĐÃ ĐẠT** | API `/logout` xóa Refresh Token khỏi Redis, do đó các yêu cầu refresh sau đó bị từ chối. |
| **11**| Sửa Payload JWT rồi gọi API | 401 Unauthorized | **ĐÃ ĐẠT** | Chữ ký số JWT không trùng khớp dẫn đến validateToken ở Gateway trả về false và bị từ chối. |
| **12**| Token hết hạn | 401 Unauthorized | **ĐÃ ĐẠT** | Bộ thư viện io.jsonwebtoken tự động phát hiện token hết hạn (ExpiredJwtException) và trả về lỗi. |

---

## 💡 GIẢI THÍCH LÝ THUYẾT & LỰA CHỌN CÔNG NGHỆ (BỔ SUNG LAB 1 - YÊU CẦU LÝ THUYẾT)

### 1. Tại sao chọn OpenFeign thay vì RestTemplate?
* **Tính khai báo (Declarative):** OpenFeign cho phép định nghĩa các client HTTP bằng cách viết interface và đánh dấu bằng `@FeignClient` cùng với các mapping của Spring MVC. Chúng ta không cần tự viết code boilerplate để xây dựng URL, gửi request và chuyển đổi kiểu dữ liệu như RestTemplate.
* **Tích hợp sẵn hệ sinh thái Spring Cloud:** OpenFeign tích hợp cực kỳ chặt chẽ với Load Balancer (Spring Cloud LoadBalancer), Eureka để tự động phân giải tên dịch vụ thành IP, và Resilience4j cho Circuit Breaker.
* **Ví dụ phù hợp:** Khi `order-service` cần gọi `product-catalog-service` để kiểm tra thông tin sản phẩm, việc sử dụng OpenFeign giúp code ngắn gọn, tự động cân bằng tải và có cơ chế fallback khi Catalog Service bị lỗi.

### 2. Tại sao chọn Kafka thay vì RabbitMQ?
* **Khả năng lưu trữ (Persistence) & Xem lại (Replay):** Kafka lưu trữ thông điệp trên đĩa cứng và cho phép người tiêu dùng (Consumers) xem lại các event cũ bằng cách thay đổi offset. RabbitMQ thường xóa thông điệp ngay sau khi được xác nhận (acknowledged).
* **Hiệu năng & Khả năng mở rộng:** Kafka được thiết kế cho luồng dữ liệu lớn (high throughput) với kiến trúc phân vùng (partitions), phù hợp cho việc thu thập log, phân tích thời gian thực và kiến trúc hướng sự kiện (Event-driven).
* **Ví dụ phù hợp:** Trong bài Lab 2, khi đơn hàng hoàn thành, sự kiện này được phát đi. `product-catalog-service` lắng nghe để trừ kho. Nếu sau này ta muốn tích hợp thêm dịch vụ gửi email hoặc dịch vụ phân tích hành vi mua sắm, các dịch vụ đó chỉ cần đăng ký lắng nghe cùng một topic mà không cần thay đổi logic của dịch vụ gửi tin.

---

## ⚠️ CÁC ĐIỂM CẦN LƯU Ý / GỢI Ý NÂNG CẤP

1. **MongoDB**: Yêu cầu Lab 2 có đề cập *"Sử dụng redis và mongodb giải quyết 1 vấn đề nào đó"*. Hiện tại hệ thống đang sử dụng **Redis** rất hiệu quả cho Refresh Token và Cart Cache, nhưng chưa tích hợp **MongoDB**. Nếu giảng viên chấm điểm khắt khe về việc phải có cả hai, bạn có thể cân nhắc lưu lịch sử log đơn hàng (Order Logs/Audit Trail) hoặc các đoạn hội thoại chatbot vào MongoDB.
2. **Keycloak (Lab 3 - Câu 2)**: Vì lab yêu cầu chọn 1 trong 2 câu, việc bạn hoàn thành xuất sắc **Câu 1** (Auth Service tự xây dựng kết hợp JWT + Redis) đã hoàn toàn đáp ứng đủ tiêu chí chấm điểm bảo mật.
