package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtTokenUtil;
import com.rainbowforest.userservice.service.UserService;
import com.rainbowforest.userservice.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * [ĐỒ ÁN CUỐI MÔN - YÊU CẦU 5 & 6]
 * - AUTHENTICATION & AUTHORIZATION (JWT): Cung cấp dịch vụ Đăng ký, Đăng nhập, cấp phát Access Token có chữ ký JWT.
 * - REFRESH TOKEN & NOSQL REDIS:
 *   - Sau khi đăng nhập thành công, tạo một cặp Access Token (JWT) ngắn hạn và Refresh Token (UUID) dài hạn.
 *   - Refresh Token được lưu trữ tập trung trong Redis (NoSQL) với thời gian hết hạn là 7 ngày để phục vụ cấp lại Access Token
 *     và quản lý phiên làm việc một cách bảo mật, tối ưu hiệu năng.
 *   - Khi Logout, xóa Refresh Token khỏi Redis để hủy phiên làm việc ngay lập tức.
 */
@RestController
@Slf4j
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Autowired
    private com.rainbowforest.userservice.repository.UserRoleRepository roleRepository;

    private static final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    @PostMapping("/login/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");
        if (idToken == null || idToken.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Thiếu Google ID Token");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> googleProfile = restTemplate.getForObject(verifyUrl, Map.class);
            
            if (googleProfile == null || googleProfile.get("error_description") != null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Google ID Token không hợp lệ");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String email = (String) googleProfile.get("email");
            String name = (String) googleProfile.get("name");
            
            if (email == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Không thể lấy email từ Google");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User user = userService.getUserByEmail(email);
            if (user == null) {
                user = new User();
                String baseUsername = email.split("@")[0];
                String username = baseUsername;
                int count = 0;
                while (userService.getUserByName(username) != null) {
                    count++;
                    username = baseUsername + count;
                }
                user.setUserName(username);
                user.setUserPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setActive(1);

                com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
                details.setEmail(email);
                
                String firstName = "Google";
                String lastName = "User";
                if (name != null && !name.trim().isEmpty()) {
                    String[] nameParts = name.trim().split(" ");
                    if (nameParts.length > 0) {
                        lastName = nameParts[nameParts.length - 1];
                        if (nameParts.length > 1) {
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < nameParts.length - 1; i++) {
                                sb.append(nameParts[i]).append(" ");
                            }
                            firstName = sb.toString().trim();
                        } else {
                            firstName = lastName;
                        }
                    }
                }
                details.setFirstName(firstName);
                details.setLastName(lastName);
                details.setPhoneNumber("");
                details.setStreet("");
                details.setStreetNumber("");
                details.setZipCode("");
                details.setLocality("");
                details.setCountry("");
                
                user.setUserDetails(details);
                
                com.rainbowforest.userservice.entity.UserRole userRole = roleRepository.findUserRoleByRoleName("ROLE_USER");
                user.setRole(userRole);

                user = userService.saveUser(user);
            }

            String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
            String token = jwtTokenUtil.generateToken(user.getUserName(), role, user.getId());
            String refreshToken = UUID.randomUUID().toString();

            redisTemplate.opsForValue().set("refresh_token:" + refreshToken, String.valueOf(user.getId()), 7, TimeUnit.DAYS);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("refreshToken", refreshToken);
            response.put("username", user.getUserName());
            response.put("role", role);
            response.put("userId", user.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi xác thực Google Token: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Đã xảy ra lỗi khi liên kết tài khoản Google: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        User user = userService.getUserByName(username);
        if (user == null || !passwordEncoder.matches(password, user.getUserPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Tên đăng nhập hoặc mật khẩu không đúng");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String token = jwtTokenUtil.generateToken(user.getUserName(), role, user.getId());
        String refreshToken = UUID.randomUUID().toString();

        // Store refresh token in Redis for 7 days
        redisTemplate.opsForValue().set("refresh_token:" + refreshToken, String.valueOf(user.getId()), 7, TimeUnit.DAYS);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("username", user.getUserName());
        response.put("role", role);
        response.put("userId", user.getId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        if (refreshToken == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Thiếu Refresh Token");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String userIdStr = redisTemplate.opsForValue().get("refresh_token:" + refreshToken);
        if (userIdStr == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Refresh Token không hợp lệ hoặc đã hết hạn");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        Long userId = Long.parseLong(userIdStr);
        User user = userService.getUserById(userId);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Người dùng không tồn tại");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String newAccessToken = jwtTokenUtil.generateToken(user.getUserName(), role, user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", newAccessToken);
        response.put("refreshToken", refreshToken);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        if (refreshToken != null) {
            redisTemplate.delete("refresh_token:" + refreshToken);
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Vui lòng nhập Email");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Không tìm thấy tài khoản liên kết với email này");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, email);

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        String subject = "Nexus Shop - Yêu cầu thiết lập lại mật khẩu";
        String body = "Xin chào " + user.getUserName() + ",\n\n" +
                "Bạn đã yêu cầu khôi phục mật khẩu tại Nexus Shop.\n" +
                "Vui lòng nhấn vào đường dẫn dưới đây để đặt lại mật khẩu mới:\n" +
                resetLink + "\n\n" +
                "Đường dẫn này có hiệu lực trong vòng 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\n" +
                "Trân trọng,\nNexus Shop Support Team.";

        emailService.sendEmail(email, subject, body);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null || newPassword.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Yêu cầu đặt lại mật khẩu không hợp lệ");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String email = resetTokens.get(token);
        if (email == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Yêu cầu đã hết hạn hoặc mã xác thực không hợp lệ");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Không tìm thấy người dùng");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        // Change password
        userService.changePassword(user.getId(), null, newPassword);
        resetTokens.remove(token);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mật khẩu của bạn đã được thay đổi thành công!");
        return ResponseEntity.ok(response);
    }
}
