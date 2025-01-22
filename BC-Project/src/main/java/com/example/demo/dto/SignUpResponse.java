package com.example.demo.dto;

public class SignUpResponse {
    private boolean success; // 성공 여부
    private String message; // 메시지
	public boolean isSuccess() {
		return success;
	}
	public void setSuccess(boolean success) {
		this.success = success;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}

    // Getter, Setter
}