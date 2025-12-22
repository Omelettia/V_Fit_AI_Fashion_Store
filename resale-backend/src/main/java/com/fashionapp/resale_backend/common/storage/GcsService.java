package com.fashionapp.resale_backend.common.storage;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GcsService {

    private final Storage storage;

    @Value("${gcp.bucket.name}")
    private String bucketName;

    /**
     * Uploads a file to a specific folder in GCS.
     * @return The full gs:// URI (e.g., gs://my-bucket/products/uuid.jpg)
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Create a unique filename to avoid overwrites
        String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return String.format("gs://%s/%s", bucketName, fileName);
    }
}