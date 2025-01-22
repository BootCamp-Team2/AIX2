package com.example.demo.dto;

public class LoginResponse {
    private String token; // JWT 토큰
    private int loginStatus; // 로그인 상태
    private String message; // 메시지

    // 생성자 추가
    public LoginResponse(String token, int loginStatus, String message) {
        this.token = token;
        this.loginStatus = loginStatus;
        this.message = message;
    }

    // Getter 및 Setter
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public int getLoginStatus() {
        return loginStatus;
    }

    public void setLoginStatus(int loginStatus) {
        this.loginStatus = loginStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
