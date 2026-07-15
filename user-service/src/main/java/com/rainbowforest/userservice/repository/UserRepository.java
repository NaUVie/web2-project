package com.rainbowforest.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.rainbowforest.userservice.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserName(String userName);

    @Query("SELECT u FROM User u WHERE u.userDetails.email = :email")
    User findByEmail(@Param("email") String email);
}
