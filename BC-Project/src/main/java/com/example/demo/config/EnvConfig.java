package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class EnvConfig {

    private final Dotenv dotenv;

    public EnvConfig() {
        dotenv = Dotenv.configure().directory(".").load(); // 맥 환경?
        // dotenv = Dotenv.configure().directory("C:/Love_Project/Bc-Project").filename(".env").load(); // 윈도우 환경?
    }

    // public void init() {
    //     Dotenv dotenv = Dotenv.configure().directory(".").load();
    //     System.setProperty("MYSQL_DB_URL", dotenv.get("MYSQL_DB_URL"));
    //     System.setProperty("MYSQL_DB_USERNAME", dotenv.get("MYSQL_DB_USERNAME"));
    //     System.setProperty("MYSQL_DB_PASSWORD", dotenv.get("MYSQL_DB_PASSWORD"));
    // }

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

    public String getMysqlURL() {
        return dotenv.get("MYSQL_DB_URL");
    }

    public String getMysqlUsername() {
        return dotenv.get("MYSQL_DB_USERNAME");
    }

    public String getMysqlPassword() {
        return dotenv.get("MYSQL_DB_PASSWORD");
    }

    public Dotenv getDotenv() {
        return dotenv;
    }
}
