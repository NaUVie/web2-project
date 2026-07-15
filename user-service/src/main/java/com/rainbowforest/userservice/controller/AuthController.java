package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtTokenUtil;
import com.rainbowforest.userservice.service.UserService;
import com.rainbowforest.userservice.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private EmailService emailService;

    private static final Map<String, String> resetTokens = new ConcurrentHashMap<>();

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

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUserName());
        response.put("role", role);
        response.put("userId", user.getId());

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
