package com.overthecam.battle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HttpsURLConnection;

public class SSLConfig {
    @Bean
    public RestTemplate restTemplate() throws Exception {
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        return new RestTemplate();
    }
}
