package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class EnvConfig {

    private final Dotenv dotenv;

    public EnvConfig() {
        dotenv = Dotenv.configure().directory(".").load();
    }

    // 데이터베이스 설정
    public String getDatabaseUrl() {
        return dotenv.get("DB_URL");
    }

    public String getDatabaseUsername() {
        return dotenv.get("DB_USERNAME");
    }

    public String getDatabasePassword() {
        return dotenv.get("DB_PASSWORD");
    }

    public String getHttpsApiKey() {
        return dotenv.get("HTTPS_API_KEY");
    }

    public String getHttpsTimeout() {
        return dotenv.get("HTTPS_TIMEOUT"); // 예를 들어, 타임아웃 설정
    }

    public String getJwtSecretKey() {
        return dotenv.get("JWT_SECRET_KEY");
    }

    // 초기 사용자 정보 읽기
    public String getInitialUsername() {
        return dotenv.get("INITIAL_USERNAME");
    }

    public String getInitialPassword() {
        return dotenv.get("INITIAL_PASSWORD");
    }

    public String getInitialSecretKey() {
        return dotenv.get("INITIAL_SECRET_KEY");
    }

    public Dotenv getDotenv() {
        return dotenv;
    }
}
