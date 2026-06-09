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
}
