package com.rainbowforest.userservice.service;

import java.util.List;

import com.rainbowforest.userservice.entity.User;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User getUserByName(String userName);
    User saveUser(User user);
    User getUserByEmail(String email);
    User updateUserProfile(Long id, User userDetails);
    User changePassword(Long id, String oldPassword, String newPassword);
    void deleteUser(Long id);
    User updateUserRole(Long id, String roleName);
}
