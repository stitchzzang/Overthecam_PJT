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
        log.debug("OpenVidu Secret: {}", OPENVIDU_SECRET);

        String finalUrl = OPENVIDU_URL;
        if (!finalUrl.contains(":4443")) {
            finalUrl = finalUrl + ":4443";
            log.info("Added port to URL: {}", finalUrl);
        }

//        if (!finalUrl.startsWith("https://")) {
//            finalUrl = "https://" + finalUrl;
//            log.info("Added https to URL: {}", finalUrl);
//        }

        return new OpenVidu(finalUrl, OPENVIDU_SECRET);
    }

}
