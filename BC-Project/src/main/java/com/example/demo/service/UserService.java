package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.User; // User 엔티티 import
import com.example.demo.dto.DisableMfaResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.dto.SignUpResponse;
import com.example.demo.repository.UserRepository; // UserRepository import
import com.example.demo.utils.JwtUtil; // JwtUtil import

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository; // UserRepository 주입

    @Autowired
    private JwtUtil jwtUtil; // JwtUtil 주입

    // 로그인 처리
    public LoginResponse login(LoginRequest loginRequest) {
        // 로그인 로직 구현
        // 예시: 로그인 성공 시
        String token = "generatedJWTToken"; // JWT 토큰 생성 로직 추가
        int loginStatus = 1; // 성공적으로 로그인했다고 가정
        String message = "로그인 성공";
        User user = null;

        return new LoginResponse(token, loginStatus, message, user);
    }

    // JWT 토큰 유효성 검사
    public Object validateToken(String authorizationHeader) {
        // JWT 유효성 검사 로직 구현
        return new Object(); // 응답 데이터 반환
    }

    // ID 중복 확인
    public boolean checkID(String id) {
        // ID 중복 확인 로직 구현
        return false; // 중복 여부 반환
    }

    // 회원가입 처리
    public SignUpResponse signUp(SignUpRequest signUpRequest) {
        // 회원가입 로직 구현
        return new SignUpResponse();
    }

    // 2차 인증 비활성화
    public DisableMfaResponse disableTwoFactorAuth(String authorizationHeader) {
        // 2차 인증 비활성화 로직 구현
        return new DisableMfaResponse();
    }

    // JWT를 통해 사용자 정보 가져오기
    public User getUserByToken(String token) {
        String userEmail = jwtUtil.extractEmail(token); // JWT에서 사용자 ID 추출
        return userRepository.findByEmail(userEmail).orElse(null); // 사용자 찾기
    }

    // 성별에 따른 위치 데이터 가져오기
    public long getOppositeGenderCount(String gender, String region) {
        String oppositeGender = gender.equals("남성") ? "여성" : "남성";
        return userRepository.countByGenderAndRegion(oppositeGender, region);
    }
}