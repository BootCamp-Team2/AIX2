package com.example.demo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "userUID", nullable = false, unique = true) // UUID 추가
    private String userUID; // UUID 필드 추가

    @Column(nullable = false, unique = true, length = 255)
    private String email; // 이메일 (ID)

    @Column(nullable = false)
    private String password; // 비밀번호 (해시 저장)

    @Column(nullable = false, length = 50)
    private String username; // 닉네임

    @Column(length = 255)
    private String gender; // 성별

    @Column(length = 10)
    private String mbti; // MBTI

    @Column(length = 255)
    private String age; // 나이

    @Column(length = 100)
    private String region; // 지역

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate; // 생년월일

    @Column(name = "profile_picture", length = 255)
    private String profilePicture; // 프로필 사진 URL

    @Column(name = "character_picture", length = 255)
    private String characterPicture; // 캐릭터 사진 URL

    @Column(name = "sim_picture", length = 255)
    private String simPicture;

    @Column(name = "job", length = 255)
    private String job;

    @Column(name = "introduce", length = 255)
    private String introduce;

    @Column(name = "appeal", columnDefinition = "json")
    private List<String> appeal;

    @Column(name = "media", columnDefinition = "json")
    private String media;

    @Column(name = "secret_key", nullable = false) // 비밀 키 추가
    private String secretKey; // JWT 비밀 키

    @Column(name = "thread_key", length = 255)
    private String thread_key;

    @Column(name = "assistant_key", length = 255)
    private String assistant_key;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    // 생성자
    public User() {
        this.userUID = UUID.randomUUID().toString(); // UUID 자동 생성
    }

    // Getters and Setters
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMbti() {
        return mbti;
    }

    public void setMbti(String mbti) {
        this.mbti = mbti;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getJob() {
        return job;
    }

    public void setJob(String job) {
        this.job = job;
    }

    public String getIntroduce() {
        return introduce;
    }

    public void setIntroduce(String introduce) {
        this.introduce = introduce;
    }

    public List<String> getAppeal() {
        return appeal;
    }

    public void setAppeal(List<String> appeal) {
        this.appeal = appeal;
    }

    public String getMedia() {
        return media;
    }

    public void setMedia(String media) {
        this.media = media;
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

    public String getSimPicture() {
        return simPicture;
    }

    public void setSimPicture(String simPicture) {
        this.simPicture = simPicture;
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
