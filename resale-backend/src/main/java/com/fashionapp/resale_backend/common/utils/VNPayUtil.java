package com.fashionapp.resale_backend.common.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;

public class VNPayUtil {
    private static final Logger LOGGER = Logger.getLogger(VNPayUtil.class.getName());

    private VNPayUtil() {}

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null || key.isEmpty() || data.isEmpty()) {
                return "";
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Error calculating HMAC SHA512", ex);
            return "";
        }
    }
}