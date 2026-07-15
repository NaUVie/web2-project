package com.rainbowforest.chatbotservice.controller;

import com.rainbowforest.chatbotservice.dto.ChatRequest;
import com.rainbowforest.chatbotservice.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/chat")
public class ChatbotController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate loadBalancedRestTemplate;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String defaultApiKey;

    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {
        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Vui lòng nhập tin nhắn."));
        }

        // Get products from catalog service
        String productsContext = "";
        try {
            ResponseEntity<List> catalogResponse = loadBalancedRestTemplate.getForEntity("http://product-catalog-service/products", List.class);
            if (catalogResponse.getStatusCode().is2xxSuccessful() && catalogResponse.getBody() != null) {
                productsContext = catalogResponse.getBody().toString();
            }
        } catch (Exception e) {
            System.err.println("Could not fetch products from catalog-service: " + e.getMessage());
        }

        // Formulate the prompt context
        String systemPrompt = "Bạn là trợ lý AI thông minh đóng vai trò nhân viên tư vấn sản phẩm của Nexus Shop (chuyên laptop MacBook, iPhone, tai nghe Sony, giày Nike, bàn phím cơ, màn hình gaming và tay cầm chơi game).\n" +
                "Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.\n" +
                "Sản phẩm có sẵn trong shop: " + productsContext + "\n" +
                "Nếu khách hỏi mua hoặc tìm sản phẩm, hãy gợi ý tên chính xác sản phẩm đó.\n" +
                "Khách hỏi: \"" + userMessage + "\"";

        // Determine API key to use
        String apiKey = request.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("undefined")) {
            apiKey = defaultApiKey;
        }

        try {
            // Build Gemini request body
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", systemPrompt);
            parts.add(partMap);
            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

            // Call Gemini REST API
            String url = geminiApiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, httpEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    if (content != null) {
                        List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                        if (resParts != null && !resParts.isEmpty()) {
                            String reply = (String) resParts.get(0).get("text");
                            return ResponseEntity.ok(new ChatResponse(reply));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
        }

        // Fallback response if API call fails
        String fallbackResponse = getFallbackResponse(userMessage);
        return ResponseEntity.ok(new ChatResponse(fallbackResponse));
    }

    private String getFallbackResponse(String userText) {
        String lower = userText.toLowerCase();
        if (lower.contains("chào") || lower.contains("hi") || lower.contains("hello")) {
            return "Xin chào! Tôi là Trợ Lý Nexus. Tôi có thể giúp gì cho bạn hôm nay?";
        } else if (lower.contains("giá") || lower.contains("bao nhiêu") || lower.contains("mua")) {
            return "Chúng tôi cung cấp các sản phẩm công nghệ chính hãng như MacBook Pro M3 Max, iPhone 15 Pro, Tai nghe Sony WH-1000XM5, Giày Nike Air Max 270, và các dòng tay cầm chơi game DualSense, Flydigi Apex 4. Bạn muốn tìm hiểu giá của sản phẩm nào cụ thể không?";
        } else if (lower.contains("ship") || lower.contains("vận chuyển") || lower.contains("giao hàng")) {
            return "Nexus Shop hỗ trợ giao hàng nhanh toàn quốc. Miễn phí vận chuyển cho tất cả đơn hàng!";
        } else if (lower.contains("bảo hành") || lower.contains("đổi trả")) {
            return "Tất cả sản phẩm chính hãng tại Nexus Shop đều được bảo hành 12 tháng và hỗ trợ lỗi 1 đổi 1 trong vòng 7 ngày đầu.";
        } else if (lower.contains("tay cầm") || lower.contains("flydigi") || lower.contains("dualsense") || lower.contains("gamesir")) {
            return "Chúng tôi có sẵn các mẫu tay cầm chơi game cực hot: Sony DualSense (cho PS5), Flydigi Apex 4 (có màn hình LED), Flydigi Vader 3 Pro, Gamesir G8 Galileo và Gamesir T4 Cyclone Pro. Bạn cần tư vấn mẫu nào?";
        }
        return "Chào bạn, hiện tại tôi đang ở chế độ ngoại tuyến. Bạn có câu hỏi nào về các sản phẩm như MacBook, iPhone, tai nghe Sony, giày Nike hay tay cầm chơi game không?";
    }
}
