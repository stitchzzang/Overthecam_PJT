package com.overthecam.websocket.config;

import com.overthecam.websocket.interceptor.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 메시지 브로커가 지원하는 WebSocket 메시지 처리를 활성화
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){
        config.enableSimpleBroker("/api/subscribe"); // 구독(브로드캐스트)용 prefix
        config.setApplicationDestinationPrefixes("/api/publish"); // 클라이언트에서 서버로 발행하는 메시지의 prefix
        config.setUserDestinationPrefix("/user"); // 사용자별 메시지 라우팅을 위한 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws-connect") // 초기 핸드셰이크 과정에서 사용할 endpoint 지정
            .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5500") // CORS 허용 설정
            .withSockJS(); // SockJS 지원 추가
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
