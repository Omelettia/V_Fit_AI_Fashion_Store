package com.fashionapp.resale_backend.product;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            Category tops = categoryRepository.save(new Category("Tops", null));
            Category bottoms = categoryRepository.save(new Category("Bottoms", null));

            categoryRepository.save(new Category("Vintage T-Shirts", tops));

            System.out.println("--- Fashion Categories Initialized Successfully ---");
        }
    }
}