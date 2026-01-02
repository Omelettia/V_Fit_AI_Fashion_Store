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
        // 1. Get Auth Token using Service Account JSON from Environment Variable
        GoogleCredentials credentials = getCredentials();

        // Ensure the token is valid/refreshed
        credentials.refreshIfExpired();
        String token = credentials.getAccessToken().getTokenValue();

        // 2. Build API URL
        String url = String.format("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/virtual-try-on-preview-08-04:predict",
                location, projectId, location);

        // 3. Construct Request Body
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

        // 4. Send Request using WebClient
        log.info("Sending Try-On request to Vertex AI project: {}", projectId);

        String responseBody = aiWebClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseBase64ToDataUrl(responseBody);
    }

    /**
     * Helper to load credentials from Environment Variable or Local Shell
     */
    private GoogleCredentials getCredentials() throws IOException {
        String gcpKeyJson = System.getenv("GCP_JSON_KEY");

        if (gcpKeyJson != null && !gcpKeyJson.isBlank()) {
            log.info("Using GCP credentials from environment variable 'GCP_JSON_KEY'");
            return GoogleCredentials.fromStream(
                    new ByteArrayInputStream(gcpKeyJson.getBytes(StandardCharsets.UTF_8))
            ).createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
        }

        log.info("GCP_JSON_KEY not found. Falling back to Application Default Credentials...");
        return GoogleCredentials.getApplicationDefault()
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
    }

    private String parseBase64ToDataUrl(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode predictions = root.path("predictions");

        if (predictions.isArray() && !predictions.isEmpty()) {
            JsonNode firstItem = predictions.get(0);
            String base64 = firstItem.path("bytesBase64Encoded").asText();
            String mimeType = firstItem.path("mimeType").asText("image/png");

            if (base64 != null && !base64.isEmpty()) {
                log.info("Successfully received Base64 image from Vertex AI. Length: {}", base64.length());
                return String.format("data:%s;base64,%s", mimeType, base64);
            }
        }

        log.error("AI Response failed to provide image bytes. Response: {}", responseBody);
        throw new RuntimeException("AI failed to generate virtual try-on image.");
    }
}