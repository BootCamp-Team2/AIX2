package com.example.demo.loder;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.demo.User;
import com.example.demo.config.EnvConfig;
import com.example.demo.repository.UserRepository;
import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.PasswordUtil; // PasswordUtil import 추가

@Component
public class InitialDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EnvConfig envConfig;
    private final JwtUtil jwtUtil; // JwtUtil 인스턴스 추가
    private final PasswordUtil passwordUtil; // PasswordUtil 인스턴스 추가

    public InitialDataLoader(UserRepository userRepository, EnvConfig envConfig, JwtUtil jwtUtil, PasswordUtil passwordUtil) {
        this.userRepository = userRepository;
        this.envConfig = envConfig;
        this.jwtUtil = jwtUtil; // 주입받기
        this.passwordUtil = passwordUtil; // PasswordUtil 주입받기
    }

    @Override
    public void run(String... args) throws Exception {
        // 초기 사용자 정보 확인
        if (userRepository.findByUsername(envConfig.getInitialUsername()) == null) {
            User admin = new User();
            admin.setUsername(envConfig.getInitialUsername());
            
            // 비밀번호 해시 처리 (PasswordUtil 사용)
            String rawPassword = envConfig.getInitialPassword();
            String hashedPassword = passwordUtil.hashPassword(rawPassword); // PasswordUtil 사용
            admin.setPassword(hashedPassword);
            admin.setSecretKey(envConfig.getInitialSecretKey());

            // 생년월일과 이메일 설정
            admin.setBirthDate(LocalDate.now()); // 오늘 날짜로 설정
            admin.setEmail("test@test.com"); // 초기 이메일 설정

            // 사용자 저장
            userRepository.save(admin);

            // JWT 토큰 생성
            String token = jwtUtil.generateToken(admin.getUsername()); // secretKey 제거
            System.out.println("Initial admin token: " + token);
        }
    }
}
