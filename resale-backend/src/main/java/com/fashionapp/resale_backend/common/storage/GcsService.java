package com.fashionapp.resale_backend.common.storage;

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
     * Uploads a file to GCS and returns both public and internal links.
     * Required for dual-use: Frontend rendering and AI processing.
     */
    public FileUploadResult uploadFile(MultipartFile file, String folder) throws IOException {
        // 1. Generate unique filename
        String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 2. Configure Blob metadata
        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        // 3. Perform the upload to Google Cloud
        storage.create(blobInfo, file.getBytes());

        // 4. Construct the Internal URI for Vertex AI / Gemini
        // Format: gs://bucket-name/folder/filename.jpg
        String gcsUri = String.format("gs://%s/%s", bucketName, fileName);

        // 5. Construct the Public URL for React Frontend
        // Format: https://storage.googleapis.com/bucket-name/folder/filename.jpg
        String publicUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);

        return new FileUploadResult(publicUrl, gcsUri);
    }

    public void deleteFile(String gcsUri) {
        // Convert gs://bucket/folder/file.jpg to folder/file.jpg
        String fileName = gcsUri.replace("gs://" + bucketName + "/", "");
        BlobId blobId = BlobId.of(bucketName, fileName);
        storage.delete(blobId);
    }

    public FileUploadResult uploadBytes(byte[] content, String fileName, String contentType) {
        // 1. Configure Blob metadata
        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();

        // 2. Perform the upload
        storage.create(blobInfo, content);

        // 3. Construct URIs
        String gcsUri = String.format("gs://%s/%s", bucketName, fileName);
        String publicUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);

        return new FileUploadResult(publicUrl, gcsUri);
    }
}