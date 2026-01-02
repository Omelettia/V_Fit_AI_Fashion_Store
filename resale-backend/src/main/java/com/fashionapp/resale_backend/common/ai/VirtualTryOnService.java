package com.fashionapp.resale_backend.common.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VirtualTryOnService {

    private final WebClient aiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.vertex.ai.gemini.project-id}")
    private String projectId;

    @Value("${spring.ai.vertex.ai.gemini.location}")
    private String location;

    public String executeTryOn(String personGcsUri, String productGcsUri) throws IOException {
        GoogleCredentials credentials = getCredentials();
        credentials.refreshIfExpired();
        String token = credentials.getAccessToken().getTokenValue();

        String url = String.format("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/virtual-try-on-preview-08-04:predict",
                location, projectId, location);

        Map<String, Object> requestBody = Map.of(
                "instances", List.of(
                        Map.of(
                                "personImage", Map.of("image", Map.of("gcsUri", personGcsUri)),
                                "productImages", List.of(Map.of("image", Map.of("gcsUri", productGcsUri)))
                        )
                ),
                "parameters", Map.of(
                        "sampleCount", 1,
                        "safetySetting", "block_only_high",
                        "personGeneration", "allow_adult"
                )
        );

        log.info("Sending Try-On request to Vertex AI project: {}", projectId);

        // FIX: Use byte[] instead of String to save memory
        byte[] responseBytes = aiWebClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(byte[].class)
                .block();

        return parseBytesToDataUrl(responseBytes);
    }

    private GoogleCredentials getCredentials() throws IOException {
        String gcpKeyJson = System.getenv("GCP_JSON_KEY");

        if (gcpKeyJson != null && !gcpKeyJson.isBlank()) {
            return GoogleCredentials.fromStream(
                    new ByteArrayInputStream(gcpKeyJson.getBytes(StandardCharsets.UTF_8))
            ).createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
        }

        return GoogleCredentials.getApplicationDefault()
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
    }

    private String parseBytesToDataUrl(byte[] responseBytes) throws IOException {
        JsonNode root = objectMapper.readTree(responseBytes);
        JsonNode predictions = root.path("predictions");

        if (predictions.isArray() && !predictions.isEmpty()) {
            JsonNode firstItem = predictions.get(0);
            String base64 = firstItem.path("bytesBase64Encoded").asText();
            String mimeType = firstItem.path("mimeType").asText("image/png");

            if (base64 != null && !base64.isEmpty()) {
                log.info("Successfully received Base64 image. Bytes received: {}", responseBytes.length);
                return String.format("data:%s;base64,%s", mimeType, base64);
            }
        }

        throw new RuntimeException("AI failed to generate virtual try-on image.");
    }
}