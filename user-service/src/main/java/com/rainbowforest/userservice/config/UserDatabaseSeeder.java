package com.rainbowforest.userservice.config;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure User Roles exist
        UserRole adminRole = userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN");
        if (adminRole == null) {
            adminRole = new UserRole();
            adminRole.setRoleName("ROLE_ADMIN");
            adminRole = userRoleRepository.save(adminRole);
        }

        UserRole userRole = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        if (userRole == null) {
            userRole = new UserRole();
            userRole.setRoleName("ROLE_USER");
            userRole = userRoleRepository.save(userRole);
        }

        // Check if admin user exists
        User adminUser = userRepository.findByUserName("admin_user");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setUserName("admin_user");
            adminUser.setUserPassword(passwordEncoder.encode("password123"));
            adminUser.setActive(1);
            adminUser.setRole(adminRole);

            UserDetails details = new UserDetails();
            details.setFirstName("Admin");
            details.setLastName("System");
            details.setEmail("admin@example.com");
            details.setPhoneNumber("0123456789");
            details.setStreet("Admin Street");
            details.setStreetNumber("1");
            details.setZipCode("10000");
            details.setLocality("Hanoi");
            details.setCountry("Vietnam");
            adminUser.setUserDetails(details);

            userRepository.save(adminUser);
            System.out.println("======> Seeded admin_user with password123 successfully!");
        }
    }
}
