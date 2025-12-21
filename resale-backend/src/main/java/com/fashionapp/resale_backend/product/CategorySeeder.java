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
            // Level 1: Main Departments
            Category men = categoryRepository.save(new Category("Men", null));
            Category women = categoryRepository.save(new Category("Women", null));
            Category accessories = categoryRepository.save(new Category("Accessories", null));

            // Level 2 & 3: Men's Hierarchy (Names must be unique!)
            Category menTops = categoryRepository.save(new Category("Men's Tops", men));
            categoryRepository.save(new Category("Men's T-Shirts", menTops));
            categoryRepository.save(new Category("Men's Hoodies", menTops));

            Category menBottoms = categoryRepository.save(new Category("Men's Bottoms", men));
            categoryRepository.save(new Category("Men's Jeans", menBottoms));
            categoryRepository.save(new Category("Men's Shorts", menBottoms));

            // Level 2 & 3: Women's Hierarchy
            Category womenTops = categoryRepository.save(new Category("Women's Tops", women));
            categoryRepository.save(new Category("Women's Blouses", womenTops));
            categoryRepository.save(new Category("Women's Dresses", womenTops));

            Category womenBottoms = categoryRepository.save(new Category("Women's Bottoms", women));
            categoryRepository.save(new Category("Women's Skirts", womenBottoms));
            categoryRepository.save(new Category("Women's Leggings", womenBottoms));

            // Level 2: Accessories
            categoryRepository.save(new Category("Bags", accessories));
            categoryRepository.save(new Category("Watches", accessories));
            categoryRepository.save(new Category("Jewelry", accessories));

            System.out.println("--- Marketplace Categories Initialized Successfully ---");
        }
    }
}