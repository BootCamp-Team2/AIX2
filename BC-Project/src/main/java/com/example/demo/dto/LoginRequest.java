package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern; // 올바른 임포트

public class LoginRequest {
    
    @NotBlank(message = "아이디(Email) 입력")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String id; // 이메일

    @NotBlank(message = "패스워드 입력")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "비밀번호는 최소 8자, 하나의 문자, 숫자, 특수 문자가 포함해야 합니다."
    )
    private String pw; // 비밀번호

    // Getter, Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPw() {
        return pw;
    }

    public void setPw(String pw) {
        this.pw = pw;
    }
}
