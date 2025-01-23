package com.example.demo.dto;

import com.example.demo.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidation {
    private boolean isValid;
    private String message;
    private User user;
}
