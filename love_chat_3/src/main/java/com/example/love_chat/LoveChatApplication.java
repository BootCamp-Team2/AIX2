package com.example.love_chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class LoveChatApplication {

	public static void main(String[] args) {
		System.out.println("start!");

		SpringApplication.run(LoveChatApplication.class, args);
	}

}
