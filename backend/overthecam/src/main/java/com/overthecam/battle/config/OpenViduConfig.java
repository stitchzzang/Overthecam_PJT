package com.overthecam.battle.config;

import io.openvidu.java.client.OpenVidu;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class OpenViduConfig {

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    @Bean
    public OpenVidu openVidu() {
        log.info("OpenVidu URL: {}", OPENVIDU_URL);

        // SSL 검증 비활성화
        System.setProperty("OPENVIDU_ALLOW_SELFSIGNED_CERTIFICATES", "true");

        return new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

}
