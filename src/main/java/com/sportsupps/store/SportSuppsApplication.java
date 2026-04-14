package com.sportsupps.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class SportSuppsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SportSuppsApplication.class, args);
    }
}
