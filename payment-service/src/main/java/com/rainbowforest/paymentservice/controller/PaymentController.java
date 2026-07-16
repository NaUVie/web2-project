package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.paymentservice.config.VNPayConfig;
import com.rainbowforest.paymentservice.dto.OrderDTO;
import com.rainbowforest.paymentservice.feignclient.OrderClient;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class PaymentController {

    @Autowired
    private OrderClient orderClient;

    @GetMapping("/orders/payment-confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return new ResponseEntity<>("Invalid signature", HttpStatus.BAD_REQUEST);
        }

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            if (!"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey())) {
                fields.put(entry.getKey(), entry.getValue());
            }
        }

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    // ignore
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        if (calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            String responseCode = queryParams.get("vnp_ResponseCode");
            String orderIdStr = queryParams.get("vnp_TxnRef");
            if ("00".equals(responseCode)) {
                Long orderId = Long.parseLong(orderIdStr);
                Map<String, String> payload = new HashMap<>();
                payload.put("status", "PAID");
                payload.put("paymentStatus", "PAID");
                orderClient.updateOrderStatus(orderId, payload);
                System.out.println("======> PAYMENT SERVICE: VNPay verified Order #" + orderId + " as PAID");

                Map<String, String> result = new HashMap<>();
                result.put("status", "SUCCESS");
                result.put("message", "Thanh toán thành công");
                return ResponseEntity.ok(result);
            } else {
                Long orderId = Long.parseLong(orderIdStr);
                Map<String, String> payload = new HashMap<>();
                payload.put("status", "CANCELLED");
                payload.put("paymentStatus", "FAILED");
                orderClient.updateOrderStatus(orderId, payload);
                System.out.println("======> PAYMENT SERVICE: VNPay verified Order #" + orderId + " as CANCELLED due to failed/canceled payment");

                Map<String, String> result = new HashMap<>();
                result.put("status", "FAILED");
                result.put("message", "Thanh toán thất bại, mã lỗi: " + responseCode);
                return ResponseEntity.ok(result);
            }
        } else {
            return new ResponseEntity<>("Signature verification failed", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/orders/{orderId}/payment-url")
    public ResponseEntity<?> getPaymentUrl(@PathVariable("orderId") Long orderId, HttpServletRequest request) {
        OrderDTO order = null;
        try {
            order = orderClient.getOrderById(orderId);
        } catch (Exception ex) {
            return new ResponseEntity<>("Không thể tải thông tin đơn hàng: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (order == null) {
            return new ResponseEntity<>("Đơn hàng không tồn tại", HttpStatus.NOT_FOUND);
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus()) || !"BANK".equalsIgnoreCase(order.getPaymentMethod())) {
            return new ResponseEntity<>("Đơn hàng không ở trạng thái chờ thanh toán qua ngân hàng", HttpStatus.BAD_REQUEST);
        }

        try {
            long amountInVnd = Math.round(order.getTotal().doubleValue());
            long amountCent = amountInVnd * 100;

            String vnp_TxnRef = String.valueOf(order.getId());
            String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amountCent));
            vnp_Params.put("vnp_CurrCode", "VND");

            String returnUrl = "http://localhost:3000/payment-result";

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));

                    query.append(java.net.URLEncoder.encode(fieldName, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(responseMap);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi tạo link thanh toán: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
