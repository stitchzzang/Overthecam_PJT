package com.overthecam.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 메시지 브로커가 지원하는 WebSocket 메시지 처리를 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){
        config.enableSimpleBroker("/subscribe"); // 구독(브로드캐스트)용 prefix
        config.setApplicationDestinationPrefixes("/publish"); // 클라이언트에서 서버로 발행하는 메시지의 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-connect") // 초기 핸드셰이크 과정에서 사용할 endpoint 지정
            .setAllowedOrigins("http://127.0.0.1:5500") // CORS 허용 설정
            .withSockJS(); // SockJS 지원 추가
    }
}
