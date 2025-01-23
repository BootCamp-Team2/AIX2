package com.example.demo.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email; // 이메일

    @NotBlank(message = "패스워드 입력")
    private String password;      // 비밀번호

    @NotBlank(message = "닉네임 입력")
    private String username; // 사용자 이름

    @Pattern(regexp = "(남성|여성)$", message = "유효하지 않는 성별입니다. (남성 / 여성) 입력해주세요.")
    private String gender;
    private LocalDate birthDate; // 생년월일
    private String region;         // 지역
    private String hobby;        // 취미

    @NotBlank(message = "MBTI 입력")
    @Pattern(regexp = "^(ENFP|ENFJ|ESFP|ESFJ|ENTP|ENTJ|ESTP|ESTJ|INFP|INFJ|ISFP|ISFJ|INTP|INTJ|ISTP|ISTJ)$", message = "유효하지 않은 MBTI입니다.")
    private String mbti;

    @Override
    public String toString() {
        return "SignUpRequest{" +
                "email='" + email + '\'' +
                ", pw='" + password + '\'' +
                ", nickname='" + username + '\'' +
                ", gender='" + gender + '\'' +
                ", birthDate=" + birthDate +
                ", region='" + region + '\'' +
                ", hobby='" + hobby + '\'' +
                ", mbti='" + mbti + '\'' +
                '}';
    }
}
