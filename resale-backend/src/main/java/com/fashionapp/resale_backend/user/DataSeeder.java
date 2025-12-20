package com.fashionapp.resale_backend.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName("ROLE_BUYER").isEmpty()) {
            roleRepository.save(new Role("ROLE_BUYER"));
        }
        if (roleRepository.findByName("ROLE_SELLER").isEmpty()) {
            roleRepository.save(new Role("ROLE_SELLER"));
        }
        System.out.println("--- Roles Initialized Successfully ---");
    }
}