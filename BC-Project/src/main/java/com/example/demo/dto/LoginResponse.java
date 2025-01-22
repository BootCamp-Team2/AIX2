package com.example.demo.dto;

import com.example.demo.User;

public class LoginResponse {
    private String token; // JWT 토큰
    private int loginStatus; // 로그인 상태
    private String message; // 메시지
    private User user;

    // 생성자 추가
    public LoginResponse(String token, int loginStatus, String message, User user) {
        this.token = token;
        this.loginStatus = loginStatus;
        this.message = message;
        this.user = user;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
