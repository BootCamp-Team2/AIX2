package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfile {
    private String username;
    @JsonProperty("MBTI")
	private String MBTI;
    @JsonProperty("나이")
    private String age;
    @JsonProperty("지역")
    private String region;
    @JsonProperty("직업")
    private String job;
    @JsonProperty("자기소개")
    private String introduce;

    @Override
    public String toString() {
        return "UpdateProfileInfo{" +
            "username='" + username + '\'' +
            ", MBTI='" + MBTI + '\'' +
            ", age='" + age + '\'' +
            ", region='" + region + '\'' +
            ", job=" + job +
            ", introduce='" + introduce + '\'' +
        '}';
    }
}
