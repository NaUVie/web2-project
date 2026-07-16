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

        // Seed admin (123456)
        User admin = userRepository.findByUserName("admin");
        if (admin == null) {
            admin = new User();
            admin.setUserName("admin");
            admin.setUserPassword(passwordEncoder.encode("123456"));
            admin.setActive(1);
            admin.setRole(adminRole);

            UserDetails details = new UserDetails();
            details.setFirstName("Admin");
            details.setLastName("Nexus");
            details.setEmail("admin@nexus.com");
            details.setPhoneNumber("0123456780");
            details.setStreet("Nexus Street");
            details.setStreetNumber("10");
            details.setZipCode("10000");
            details.setLocality("Hanoi");
            details.setCountry("Vietnam");
            admin.setUserDetails(details);

            userRepository.save(admin);
            System.out.println("======> Seeded admin with 123456 successfully!");
        }

        // Seed lqutr (123456)
        User lqutr = userRepository.findByUserName("lqutr");
        if (lqutr == null) {
            lqutr = new User();
            lqutr.setUserName("lqutr");
            lqutr.setUserPassword(passwordEncoder.encode("123456"));
            lqutr.setActive(1);
            lqutr.setRole(userRole);

            UserDetails details = new UserDetails();
            details.setFirstName("Trieu");
            details.setLastName("La");
            details.setEmail("lqutr@example.com");
            details.setPhoneNumber("0987654321");
            details.setStreet("User Street");
            details.setStreetNumber("2");
            details.setZipCode("10000");
            details.setLocality("Hanoi");
            details.setCountry("Vietnam");
            lqutr.setUserDetails(details);

            userRepository.save(lqutr);
            System.out.println("======> Seeded lqutr with 123456 successfully!");
        }
    }
}
