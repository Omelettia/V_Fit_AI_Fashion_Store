package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.common.utils.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Map;
import java.util.TreeMap;

/**
 * Controller to handle the redirect from VNPay after the user completes payment.
 * This is the public-facing endpoint for the 'vnp_ReturnUrl'.
 */
@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VNPayCallbackController {

    private final PaymentService paymentService;

    @Value("${vnpay.hash_secret}")
    private String hashSecret;

    // Injects the value from application.properties
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @GetMapping("/vnpay-callback")
    public ResponseEntity<Void> handleVNPayCallback(HttpServletRequest request) {
        log.info("Received VNPay callback notification.");


        TreeMap<String, String> fields = new TreeMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                fields.put(fieldName, fieldValue);
            }
        }

        //  Extract the signature provided by VNPay
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        //  Re-calculate the hash to verify data integrity
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            hashData.append(entry.getKey())
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));

            // Use tailMap to check if this is the last element
            if (fields.tailMap(entry.getKey(), false).size() > 0) {
                hashData.append('&');
            }
        }

        String calculatedHash = VNPayUtil.hmacSHA512(hashSecret, hashData.toString());

        //  Validate signature and update order status
        String responseCode = fields.get("vnp_ResponseCode");
        String txnRef = fields.get("vnp_TxnRef");
        String amountStr = fields.get("vnp_Amount");

        if (calculatedHash.equals(vnp_SecureHash)) {
            if ("00".equals(responseCode)) {
                log.info("VNPay Payment Success for Order ID: {}", txnRef);
                paymentService.processPayment(
                        Long.parseLong(txnRef),
                        "VNPAY",
                        Double.parseDouble(amountStr),
                        responseCode
                );
                return redirect(frontendUrl + "/payment-success?orderId=" + txnRef);
            } else {
                log.warn("VNPay Payment Failed with code: {} for Order ID: {}", responseCode, txnRef);
                return redirect(frontendUrl + "/payment-failed?orderId=" + txnRef);
            }
        } else {
            log.error("VNPay Security Alert: Hash mismatch detected for Order ID: {}", txnRef);
            return redirect(frontendUrl + "/payment-error?reason=invalid_signature");
        }
    }

    private ResponseEntity<Void> redirect(String url) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }
}