package com.example.demo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsUtils;
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * org.springframework.boot:spring-boot-starter-security 의존성을 설치하면,
     * Client(react 프로젝트)가 접근할 때 권한이 있어야 해요. (SecurityContextHolder).
     * 회원가입, 로그인, 아이디 중복확인 등과 같은 권한이 없는 사용자들도 접근이 가능해야하는 API들은 허용처리를 해줘야합니다.
     */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests((authorize) -> authorize
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/users/login")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/users/signup")).permitAll()
                .requestMatchers(new AntPathRequestMatcher( "/users/check")).permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}