package com.example.demo.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileInfo {
    private String username;
    private String profile_picture;
	private String mbti;
    private String age;
    private String region;
    private String job;
    private String introduce;
    private List<String> appeal;
}
