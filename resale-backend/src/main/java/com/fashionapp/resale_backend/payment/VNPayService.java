package com.fashionapp.resale_backend.payment;

import com.fashionapp.resale_backend.common.utils.VNPayUtil;
import com.fashionapp.resale_backend.order.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    @Value("${vnpay.tmn_code}")
    private String tmnCode;

    @Value("${vnpay.hash_secret}")
    private String hashSecret;

    @Value("${vnpay.api_url}")
    private String apiUrl;

    @Value("${vnpay.return_url}")
    private String returnUrl;

    /**
     * Generates a secure redirect URL to the VNPay Sandbox/Production gateway.
     * * @param order The order entity containing ID and total amount.
     * @param ipAddress The sanitized client IP address (IPv4).
     * @return A fully qualified URL for redirection.
     */
    public String createPaymentUrl(Order order, String ipAddress) {
        log.info("Generating VNPay URL for Order ID: {} from IP: {}", order.getId(), ipAddress);

        // TreeMap ensures keys are naturally sorted, which is mandatory for the SecureHash
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", String.valueOf(order.getId()));
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        // Amount: Must be multiplied by 100 as per VNPay standard
        long amount = (long) (order.getTotalAmount() * 100);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));

        // Dates: Using GMT+7 timezone format yyyyMMddHHmmss
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Set 15-minute expiration for the payment link
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build Hash Data and Query String
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<Map.Entry<String, String>> itr = vnp_Params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                // HMAC hash data must be URL encoded
                hashData.append(key).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(key, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        // Generate HMAC SHA512 signature for security
        String secureHash = VNPayUtil.hmacSHA512(hashSecret, hashData.toString());
        String finalUrl = apiUrl + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

        log.debug("VNPay Redirect URL created successfully.");
        return finalUrl;
    }
}