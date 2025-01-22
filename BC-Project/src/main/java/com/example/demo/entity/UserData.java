package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserData {
    @Id
    private String userId; // 이메일
    private String pw;      // 비밀번호
    private String nickname; // 사용자 이름
    private LocalDate birthDate; // 생년월일
    private String region;     // 지역
    private String hobby;
    private String mbti;  
}
