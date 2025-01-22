package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    boolean existsByEmail(String email);  // ID 중복 확인을 위한 메서드
    
    Optional<User> findByEmail(String email); // 이메일로 사용자 조회

	Object findByUsername(String initialUsername);
}
