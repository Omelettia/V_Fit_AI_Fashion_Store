package com.fashionapp.resale_backend.common.seeder;

import com.fashionapp.resale_backend.address.dto.AddressCreateDto;
import com.fashionapp.resale_backend.common.storage.FileUploadResult;
import com.fashionapp.resale_backend.common.storage.GcsService;
import com.fashionapp.resale_backend.product.*;
import com.fashionapp.resale_backend.user.*;
import com.fashionapp.resale_backend.user.dto.ProfileUpdateDto;
import com.fashionapp.resale_backend.user.dto.UserRegistrationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final GcsService gcsService;
    private final ResourceLoader resourceLoader;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        log.info("--- Starting Database Seeding ---");
        seedRoles();
        seedCategories();

        // Only seed if no users exist to avoid duplicate GCS uploads/DB entries
        if (userRepository.count() == 0) {
            List<User> sellers = seedSellers();
            seedProducts(sellers);
        } else {
            log.info("Database already seeded. Skipping...");
        }
        log.info("--- Seeding Complete ---");
    }

    private void seedRoles() {
        if (roleRepository.findByName("ROLE_BUYER").isEmpty()) {
            roleRepository.save(new Role(null, "ROLE_BUYER"));
        }
        if (roleRepository.findByName("ROLE_SELLER").isEmpty()) {
            roleRepository.save(new Role(null, "ROLE_SELLER"));
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            // Level 1
            Category men = categoryRepository.save(new Category("Men", null));
            Category women = categoryRepository.save(new Category("Women", null));
            Category accessories = categoryRepository.save(new Category("Accessories", null));

            // Level 2 & 3
            Category menTops = categoryRepository.save(new Category("Men's Tops", men));
            categoryRepository.save(new Category("Men's T-Shirts", menTops));
            categoryRepository.save(new Category("Men's Hoodies", menTops));

            Category womenTops = categoryRepository.save(new Category("Women's Tops", women));
            categoryRepository.save(new Category("Women's Blouses", womenTops));
            categoryRepository.save(new Category("Women's Dresses", womenTops));

            categoryRepository.save(new Category("Bags", accessories));
            categoryRepository.save(new Category("Watches", accessories));
            log.info("Category Hierarchy seeded.");
        }
    }

    private List<User> seedSellers() throws IOException {
        List<String> names = List.of("Alice", "Bob", "Charlie", "Diana");
        List<User> createdUsers = new ArrayList<>();

        for (String name : names) {
            UserRegistrationDto reg = new UserRegistrationDto(
                    name.toLowerCase() + "@example.com", "password123", name, "Seller", "ROLE_BUYER"
            );
            User user = userService.registerUser(reg);
            userService.upgradeToSeller(user.getId());

            userService.updateProfile(user.getId(), new ProfileUpdateDto(name, "Marketplace", 175.0, 70.0, name + "'s Shop"));
            userService.addAddress(user.getId(), new AddressCreateDto(name + " Home", "0123456789", "123 Fashion St", "Hanoi", "HN", "10000", "Vietnam", true));

            // Seed User Gallery/Profile Photos
            uploadUserPhoto(user.getId(), name.toLowerCase() + "_1");
            uploadUserPhoto(user.getId(), name.toLowerCase() + "_2");
            createdUsers.add(user);
        }
        return createdUsers;
    }

    private void seedProducts(List<User> sellers) {
        log.info("--- Seeding Products: Matching files in seed-products folder ---");

        Category tshirts = categoryRepository.findByName("Men's T-Shirts").orElseThrow();
        Category hoodies = categoryRepository.findByName("Men's Hoodies").orElseThrow();
        Category blouses = categoryRepository.findByName("Women's Blouses").orElseThrow();
        Category dresses = categoryRepository.findByName("Women's Dresses").orElseThrow();
        Category bags = categoryRepository.findByName("Bags").orElseThrow();
        Category watches = categoryRepository.findByName("Watches").orElseThrow();

        // Matching logic to your screenshot filenames
        distribute(sellers.get(0), List.of(tshirts, blouses, bags), "p1"); // Alice
        distribute(sellers.get(1), List.of(hoodies, dresses, watches), "p1"); // Bob
        distribute(sellers.get(2), List.of(tshirts, blouses, bags), "p2"); // Charlie
        distribute(sellers.get(3), List.of(hoodies, dresses, watches), "p2"); // Diana
    }

    private void distribute(User seller, List<Category> cats, String suffix) {
        for (Category cat : cats) {
            Product product = new Product();
            product.setSeller(seller);
            product.setCategory(cat);
            product.setCondition("Excellent");
            product.setStatus("ACTIVE");

            // --- HARD-CODED INTERESTING INFO BASED ON CATEGORY ---
            String catName = cat.getName();
            List<String> availableSizes;
            List<String> availableColors = List.of("Midnight Black", "Arctic White", "Forest Green", "Deep Navy", "Slate Grey");

            if (catName.contains("T-Shirts")) {
                product.setName(seller.getFirstName() + "'s Vintage Graphic Tee");
                product.setDescription("A breathable, 100% organic cotton oversized tee. Features a unique sun-faded aesthetic and reinforced stitching.");
                product.setBrand("Heritage Wear");
                // Logic: 50,000 + (0 to 10 * 10,000) -> e.g., 60,000, 110,000
                product.setBasePrice(50000.0 + (random.nextInt(11) * 10000));
                availableSizes = List.of("S", "M", "L", "XL");
            }
            else if (catName.contains("Hoodies")) {
                product.setName("Premium Heavyweight Hoodie");
                product.setDescription("Thick fleece lining with a structured hood. Perfect for layering in colder climates. Pre-shrunk for a perfect fit.");
                product.setBrand("Urban Layer");
                // Logic: 150,000 + (0 to 10 * 20,000) -> e.g., 170,000, 230,000
                product.setBasePrice(150000.0 + (random.nextInt(11) * 20000));
                availableSizes = List.of("M", "L", "XL");
            }
            else if (catName.contains("Blouses")) {
                product.setName("Silk Floral Evening Blouse");
                product.setDescription("Elegant silk-blend blouse with puffed sleeves and a sophisticated button-down front. Lightweight and airy.");
                product.setBrand("Luxe Label");
                // Logic: 100,000 + (0 to 20 * 5,000) -> e.g., 105,000, 150,000
                product.setBasePrice(100000.0 + (random.nextInt(21) * 5000));
                availableSizes = List.of("XS", "S", "M", "L");
                availableColors = List.of("Cream Silk", "Blush Pink", "Midnight Floral");
            }
            else if (catName.contains("Dresses")) {
                product.setName("Midnight Velvet Cocktail Dress");
                product.setDescription("Stunning slim-fit dress with a subtle side slit. A timeless piece for any special occasion or formal evening event.");
                product.setBrand("Velvet & Co.");
                // Logic: 300,000 + (0 to 10 * 50,000) -> e.g., 450,000, 700,000
                product.setBasePrice(300000.0 + (random.nextInt(11) * 50000));
                availableSizes = List.of("S", "M", "L");
                availableColors = List.of("Emerald Green", "Ruby Red", "Classic Black");
            }
            else if (catName.contains("Bags")) {
                product.setName("Handcrafted Leather Tote");
                product.setDescription("Spacious interior with reinforced handles. Made from genuine full-grain leather that patinas beautifully over time.");
                product.setBrand("Nomad Goods");
                // Logic: 500,000 + (0 to 10 * 50,000) -> e.g., 550,000, 900,000
                product.setBasePrice(500000.0 + (random.nextInt(11) * 50000));
                availableSizes = List.of("One Size");
                availableColors = List.of("Tan Leather", "Cognac", "Ebony");
            }
            else if (catName.contains("Watches")) {
                product.setName("Chronograph Silver Edition");
                product.setDescription("Water-resistant up to 50m with a scratch-resistant sapphire crystal face and premium stainless steel strap.");
                product.setBrand("Timeless");
                // Logic: 1,500,000 + (0 to 5 * 100,000) -> e.g., 1,600,000, 2,000,000
                product.setBasePrice(1500000.0 + (random.nextInt(6) * 100000));
                availableSizes = List.of("40mm", "42mm");
                availableColors = List.of("Silver", "Rose Gold", "Space Grey");
            }
            else {
                product.setName(seller.getFirstName() + "'s " + catName);
                product.setDescription("High-quality fashion item curated by " + seller.getShopName());
                product.setBrand("ResaleApp");
                product.setBasePrice(100000.0 + (random.nextInt(10) * 10000));
                availableSizes = List.of("M");
            }

            // --- ADD VARIANTS ---
            product.setVariants(new ArrayList<>());
            for (String size : availableSizes) {
                int colorCount = 1 + random.nextInt(2);
                for (int i = 0; i < colorCount; i++) {
                    ProductVariant variant = new ProductVariant();
                    variant.setSize(size);
                    variant.setColor(availableColors.get(random.nextInt(availableColors.size())));
                    variant.setStockQuantity(5 + random.nextInt(20));
                    variant.setProduct(product);
                    product.getVariants().add(variant);
                }
            }

            Product savedProduct = productRepository.save(product);

            // --- THE FILENAME LOGIC ---
            String label = cat.getName().toLowerCase()
                    .replaceAll("(?i)^(men|women)'?s\\s+", "")
                    .replace(" ", "").replace("-", "");

            if (label.equals("blouses")) label = "blouse";
            else if (label.equals("dresses")) label = "dress";
            else if (label.equals("watches")) label = "watch";
            else if (label.equals("hoodies")) label = "hoodie";
            else if (label.equals("tshirts")) label = "tshirt";
            else if (label.endsWith("s") && !label.equals("dress")) label = label.substring(0, label.length() - 1);

            log.info("Generating filenames for label: {} (Category: {})", label, cat.getName());

            String baseFileName = seller.getFirstName().toLowerCase() + "_" + label + "_" + suffix;
            uploadProductPhoto(savedProduct, baseFileName + "_1");
            uploadProductPhoto(savedProduct, baseFileName + "_2");
        }
    }

    private void uploadUserPhoto(Long userId, String fileName) {
        String path = "classpath:seed-photos/" + fileName + ".jpg";
        try {
            Resource resource = resourceLoader.getResource(path);
            if (resource.exists()) {
                byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
                String base64Image = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bytes);
                userService.addAiPhotoToGallery(userId, base64Image);
            } else {
                log.warn("User photo file not found: {}", path);
            }
        } catch (Exception e) {
            log.error("Error processing user photo {}: {}", fileName, e.getMessage());
        }
    }

    private void uploadProductPhoto(Product product, String fileName) {
        String path = "classpath:seed-products/" + fileName + ".jpg";
        try {
            Resource resource = resourceLoader.getResource(path);
            if (resource.exists()) {
                byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
                // Direct GCS Upload
                FileUploadResult result = gcsService.uploadBytes(bytes, "products/" + fileName + ".jpg", "image/jpeg");

                ProductImage image = new ProductImage();
                image.setUrl(result.publicUrl());
                image.setGcsUri(result.gcsUri());
                image.setProduct(product);
                image.setMainImage(fileName.endsWith("_1")); // First image is main

                productImageRepository.save(image);
                log.info("Successfully uploaded product photo to GCS: {}", fileName);
            } else {
                log.warn("Product photo file not found at path: {}", path);
            }
        } catch (Exception e) {
            log.error("GCS Upload failed for {}: {}", fileName, e.getMessage());
        }
    }
}