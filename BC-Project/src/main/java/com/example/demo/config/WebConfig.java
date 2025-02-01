package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    public static final String ALLOWED_METHOD_NAMES = "GET,HEAD,POST,PUT,DELETE,TRACE,OPTIONS,PATCH";
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry
            .addMapping("/**")
            .allowedOrigins("http://192.168.247.137:8081")
            .allowedOriginPatterns("*")
            .allowCredentials(true)
            .allowedMethods(ALLOWED_METHOD_NAMES.split(","));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 외부 디렉토리를 /uploads/ URL로 매핑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/Users/sihyun/Documents/uploads/");
    }
}