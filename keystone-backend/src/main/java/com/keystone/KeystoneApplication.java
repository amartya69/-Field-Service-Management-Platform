package com.keystone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KeystoneApplication {
    public static void main(String[] args) {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl != null) {
            dbUrl = dbUrl.trim();
            if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
                String jdbcUrl = "jdbc:" + dbUrl;
                System.setProperty("spring.datasource.url", jdbcUrl);
            }
        }
        SpringApplication.run(KeystoneApplication.class, args);
    }
}
