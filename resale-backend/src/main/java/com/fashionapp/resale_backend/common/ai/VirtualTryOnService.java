package com.fashionapp.resale_backend.common.ai;

import com.google.auth.oauth2.GoogleCredentials;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VirtualTryOnService {

    private final WebClient.Builder webClientBuilder;

    @Value("${spring.ai.vertex.ai.gemini.project-id}")
    private String projectId;

    @Value("${spring.ai.vertex.ai.gemini.location}")
    private String location;

    @Value("${gcp.bucket.name}")
    private String bucketName;

    public String executeTryOn(String personGcsUri, String productGcsUri) throws IOException {
        // 1. Get Authentication Token via Application Default Credentials (Workload Identity)
        GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
        String token = credentials.refreshAccessToken().getTokenValue();

        // 2. Build the API URL for the Preview Model
        String url = String.format("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/virtual-try-on-preview-08-04:predict",
                location, projectId, location);

        // 3. Construct the JSON Request Body
        Map<String, Object> requestBody = Map.of(
                "instances", List.of(
                        Map.of(
                                "personImage", Map.of("image", Map.of("gcsUri", personGcsUri)),
                                "productImages", List.of(Map.of("image", Map.of("gcsUri", productGcsUri)))
                        )
                ),
                "parameters", Map.of(
                        "sampleCount", 1,
                        "storageUri", String.format("gs://%s/results/", bucketName)
                )
        );

        // 4. Send Request
        return webClientBuilder.build().post()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Blocking for simplicity; use Mono in production for true reactive
    }
}