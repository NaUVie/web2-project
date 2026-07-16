Lab1.
Phân tích một hệ thống monolithic quản lý bán hàng đơn giản (bao gồm Product và
Order), sau đó tách thành kiến trúc microservices và xây dựng hệ thống microservice đơn
giản gồm Product Service, Order Service và User Service có liên kết database.
1. Sử dụng OpenFeign hoặc RestTemplate
2. Order Service sẽ gọi API của Product Service để lấy thông tin sản phẩm và gọi
API của User Service để lấy thông tin người dùng.
3. Order Service có thể tra cứu thông tin sản phẩm khi tạo đơn hàng.
4. Service này cung cấp API để Order Service kiểm tra thông tin khách hàng trước
khi tạo đơn hàng.
5. Khi đặt hàng thì kết quả trả về phải thể hiện được thông tin sản phẩm, thông tin
người dùng, số lượng đặt mua và tổng tiền đơn hàng (test đặt nhiều sản phẩm)
6. Khi đặt hàng, kết quả trả về phải thể hiện thông tin sản phẩm, thông tin người
dùng, số lượng đặt mua và tổng tiền đơn hàng. Sử dụng RabbitMQ hoặc Kafka
để xử lý một tác vụ bất đồng bộ sau khi tạo đơn hàng, ví dụ: gửi thông báo, ghi
log, cập nhật thống kê hoặc cập nhật tồn kho.
Yêu cầu:
1. Tìm hiểu và giải thích tại sao chọn công nghệ OpenFeign hoặc RestTemplate và
RabbitMQ hoặc Kafka. Và ví dụ mỗi công nghệ đó phù hợp với trường hợp nào
trong dự án microservice.


Lab 2
Xây dựng hệ thống microservice sử dụng đã có công nghệ giao tiếp đồng bộ và bất đồng
bộ, Eureka Server, API Gateway
Câu 1. Từ bài lab trước hãy xử lý các vấn đề sau bằng saga pattern:
1. Xét trạng thái cho đơn hàng, khi giao hàng thành công, đơn hàng mang trạng thái
hoàn thành thì kho cập nhật đúng số lượng
2. Khi khách hàng đổi số điện thoại mặc định, thì đơn hàng chứa thông tin sẽ như thế
nào?
3. Thống kê doanh thu như thế nào?
4. Thông báo hệ thống cho admin?
Câu 2. Sử dụng redis và mongodb giải quyết 1 vấn đề nào đó?

LAB 3: SECURITY TRONG MICROSERVICE
Yêu cầu
Xây dựng hệ thống microservice sử dụng đã có công nghệ giao tiếp đồng bộ và bất đồng
bộ, Eureka Server, API Gateway, redis rồi chọn 1 trong 2 câu sau để làm
Sau khi hoàn thành Lab, tiêu chí:
 Áp dụng JWT hoặc OAuth2/OpenID Connect để xác thực người dùng.
 Bảo vệ API tại API Gateway và các service.
 Phân quyền người dùng theo vai trò USER và ADMIN.
 Kiểm tra quyền sở hữu dữ liệu, đặc biệt đối với đơn hàng.
 Sử dụng Swagger hoặc Postman để kiểm tra các tình huống bảo mật.
 Hiểu sự khác nhau giữa bảo mật JWT tự xây dựng và Keycloak.
Câu 1. Xây dựng Auth Service với JWT, Refresh Token và Redis
1. Xây dựng Auth Service chức năng đăng ký, đăng nhập, API cấp lại Access Token,
API logout
2. Bảo vệ API tại Gateway và các service
3. Kiểm tra quyền sở hữu đơn hàng
4. OpenFeign và truyền token
5. Swagger/OpenAPI
6. Test bắt buộc bằng Postman hoặc Swagger

ST
T

Tình huống Kết quả mong đợi
1 Đăng ký user mới Thành công, password được mã hóa
2 Login đúng username/password Nhận Access Token và Refresh

Token

3 Login sai password Không cấp token
4 Gọi API tạo đơn không có token 401 Unauthorized
5 USER tạo đơn hàng Thành công
6 USER thêm sản phẩm 403 Forbidden
7 ADMIN thêm sản phẩm Thành công
8 User A xem đơn User B 403 Forbidden hoặc 404 Not Found
9 Dùng Refresh Token cấp Access Token
mới

Thành công
10 Logout rồi dùng Refresh Token cũ 401 Unauthorized
11 Sửa Payload JWT rồi gọi API 401 Unauthorized

12 Token hết hạn 401 Unauthorized
Câu 2. Tích hợp Keycloak để đăng nhập, cấp JWT OAuth2/OpenID Connect và Swagger
OAuth2 Login
1. Cấu hình Keycloak
2. Bảo mật Gateway bằng OAuth2 Resource Server
3. Product Service và Order Service là Resource Server
Mỗi service phải tự xác minh JWT. Không được chỉ tin rằng Gateway đã xác minh
token
4. Cấu hình Role Mapping
5. Swagger OAuth2 Login
6. Service-to-Service Authentication (nâng cao)
Bổ sung một tình huống service gọi service mà không có người dùng trực tiếp.
7. Ownership và Token Expiration (nâng cao)
Ownership
User không được xem hoặc hủy đơn hàng của người khác.
Token Expiration
 Token hết hạn phải bị từ chối.
 Client cần đăng nhập lại hoặc dùng Refresh Token của Keycloak để lấy token mới.
 Không tự viết Refresh Token thủ công; sử dụng cơ chế token của Keycloak.
ST
T

Tình huống Kết quả mong đợi

1 Login qua Keycloak với USER Nhận JWT
2 Login qua Keycloak với ADMIN Nhận JWT có role ADMIN
3 Không có token gọi Order API 401 Unauthorized
4 JWT hết hạn gọi API 401 Unauthorized
5 USER thêm Product 403 Forbidden
6 ADMIN thêm Product Thành công
7 User A xem Order User B Bị từ chối
8 Swagger login OAuth2 với USER Không gọi được Admin API
9 Swagger login OAuth2 với ADMIN Gọi được Admin API
10 Gateway có token hợp lệ nhưng service nhận
token sai/tự sửa

Service vẫn từ chối
11 Order Service gọi Payment Service bằng Thành công

Client Credentials
12 Gọi Payment Service không có service token 401 Unauthorized hoặc 403

Forbidden

Lab 4
Viết Dockerfile 
Dockerize Eureka Server và API Gateway.
Viết compose.yaml chạy tối thiểu 5 container.
Sử dụng Docker Volume cho database.
Chạy toàn bộ hệ thống bằng: docker compose up --build
Thêm Spring Boot Actuator 
Kiểm tra endpoint:  /actuator/health ,  /actuator/metrics
Thêm Circuit Breaker khi Order Service gọi Product Service.
Thực hiện test Product Service bị dừng và trình bày kết quả.




ĐỒ ÁN CUỐI MÔN: CHUYÊN ĐỀ LẬP TRÌNH WEB 2

1. Yêu cầu đồ án
Sinh viên xây dựng một hệ thống Web theo kiến trúc Microservices, có Frontend,
Backend, cơ sở dữ liệu, bảo mật, giao tiếp giữa các service và triển khai bằng Docker.
Hệ thống nên sử dụng các công nghệ/chức năng sau:
1. Spring Boot
2. Microservices
3. Frontend
4. SQL Database: MySQL hoặc PostgreSQL
5. NoSQL: Redis hoặc MongoDB
6. Authentication &amp; Authorization: JWT Security
7. Load Balancing &amp; Scaling: Eureka Server, API Gateway
8. Giao tiếp đồng bộ: OpenFeign,…
9. Giao tiếp bất đồng bộ: Kafka hoặc RabbitMQ
10. Logging &amp; Error Handling
11. Rate Limiting
12. Caching
13. Availability &amp; Recovery (nếu có)
14. Docker (điểm cộng)
15. Cloud &amp; Compute (Gợi ý)
16. Báo cáo, Demo và Phản biện