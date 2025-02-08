package com.overthecam.battle.controller;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenViduConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
