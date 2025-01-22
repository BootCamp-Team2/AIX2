package com.example.demo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 고유 ID

    @Column(nullable = false, unique = true, length = 255)
    private String email; // 이메일 (ID)

    @Column(nullable = false)
    private String password; // 비밀번호 (해시 저장)

    @Column(nullable = false, length = 50)
    private String username; // 닉네임

    @Column(length = 10)
    private String mbti; // MBTI

    @Column(length = 255)
    private String hobby; // 취미

    @Column(length = 100)
    private String region; // 지역

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate; // 생년월일

    @Column(name = "profile_picture", length = 255)
    private String profilePicture; // 프로필 사진 URL

    @Column(name = "character_picture", length = 255)
    private String characterPicture; // 캐릭터 사진 URL

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    @Column(name = "secret_key", nullable = false) // 비밀 키 추가
    private String secretKey; // JWT 비밀 키

    @Column(name = "userUID", nullable = false, unique = true) // UUID 추가
    private String userUID; // UUID 필드 추가

    // 생성자
    public User() {
        this.userUID = UUID.randomUUID().toString(); // UUID 자동 생성
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {  
        return username;
    }

    public void setUsername(String username) {  
        this.username = username;
    }

    public String getMbti() {
        return mbti;
    }

    public void setMbti(String mbti) {
        this.mbti = mbti;
    }

    public String getHobby() {
        return hobby;
    }

    public void setHobby(String hobby) {
        this.hobby = hobby;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getCharacterPicture() {
        return characterPicture;
    }

    public void setCharacterPicture(String characterPicture) {
        this.characterPicture = characterPicture;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getSecretKey() { // 비밀 키 가져오기
        return secretKey;
    }

    public void setSecretKey(String secretKey) { // 비밀 키 설정하기
        this.secretKey = secretKey;
    }

    public String getUserUID() { // UUID 가져오기
        return userUID;
    }

    // 생성일 및 수정일 자동 설정
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void encodePassword() {
        this.password = new BCryptPasswordEncoder().encode(password);
    }
}
