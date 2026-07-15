package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.rainbowforest.userservice.kafka.UserProfileEventProducer userProfileEventProducer;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        
        UserRole role = userRoleRepository.findUserRoleByRoleName(
                user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER"
        );
        if (role == null) {
            role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
            if (role == null) {
                role = new UserRole();
                role.setRoleName("ROLE_USER");
                role = userRoleRepository.save(role);
            }
        }
        
        // Ensure ROLE_ADMIN role exists too
        UserRole adminRole = userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN");
        if (adminRole == null) {
            UserRole newAdminRole = new UserRole();
            newAdminRole.setRoleName("ROLE_ADMIN");
            userRoleRepository.save(newAdminRole);
        }

        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User updateUserProfile(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            boolean detailsChanged = false;
            String newPhone = null;
            String newStreet = null;
            String newStreetNum = null;
            String newZip = null;
            String newLocal = null;
            String newCountry = null;

            if (updatedUser.getUserDetails() != null) {
                com.rainbowforest.userservice.entity.UserDetails existingDetails = existingUser.getUserDetails();
                com.rainbowforest.userservice.entity.UserDetails updatedDetails = updatedUser.getUserDetails();
                if (existingDetails == null) {
                    existingDetails = new com.rainbowforest.userservice.entity.UserDetails();
                }
                existingDetails.setFirstName(updatedDetails.getFirstName());
                existingDetails.setLastName(updatedDetails.getLastName());
                existingDetails.setPhoneNumber(updatedDetails.getPhoneNumber());
                existingDetails.setStreet(updatedDetails.getStreet());
                existingDetails.setStreetNumber(updatedDetails.getStreetNumber());
                existingDetails.setZipCode(updatedDetails.getZipCode());
                existingDetails.setLocality(updatedDetails.getLocality());
                existingDetails.setCountry(updatedDetails.getCountry());
                existingUser.setUserDetails(existingDetails);

                detailsChanged = true;
                newPhone = updatedDetails.getPhoneNumber();
                newStreet = updatedDetails.getStreet();
                newStreetNum = updatedDetails.getStreetNumber();
                newZip = updatedDetails.getZipCode();
                newLocal = updatedDetails.getLocality();
                newCountry = updatedDetails.getCountry();
            }
            if (updatedUser.getUserPassword() != null && !updatedUser.getUserPassword().isEmpty()) {
                existingUser.setUserPassword(passwordEncoder.encode(updatedUser.getUserPassword()));
            }
            
            User saved = userRepository.save(existingUser);
            
            // Publish Event to Kafka
            if (detailsChanged) {
                try {
                    com.rainbowforest.userservice.kafka.UserProfileUpdatedEvent event = 
                        new com.rainbowforest.userservice.kafka.UserProfileUpdatedEvent(
                            saved.getId(),
                            newPhone,
                            newStreet,
                            newStreetNum,
                            newZip,
                            newLocal,
                            newCountry
                        );
                    userProfileEventProducer.sendProfileUpdatedEvent(event);
                } catch (Exception ex) {
                    System.err.println("Failed to publish profile update event: " + ex.getMessage());
                }
            }
            return saved;
        }
        return null;
    }

    @Override
    public User changePassword(Long id, String oldPassword, String newPassword) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setUserPassword(passwordEncoder.encode(newPassword));
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User updateUserRole(Long id, String roleName) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            UserRole role = userRoleRepository.findUserRoleByRoleName(roleName);
            if (role == null) {
                role = new UserRole();
                role.setRoleName(roleName);
                role = userRoleRepository.save(role);
            }
            existingUser.setRole(role);
            return userRepository.save(existingUser);
        }
        return null;
    }
}
