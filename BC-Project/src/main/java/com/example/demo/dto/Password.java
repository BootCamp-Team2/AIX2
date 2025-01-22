package com.example.demo.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Password {
	@Pattern(
			regexp="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
			message = "비밀번호는 최소 8자, 하나의 문자, 숫자, 특수 문자가 포함해야 합니다."
			)
	private String pw;
}