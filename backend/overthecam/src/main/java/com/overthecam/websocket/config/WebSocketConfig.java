package com.overthecam.websocket.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.websocket.interceptor.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker // 메시지 브로커가 지원하는 WebSocket 메시지 처리를 활성화
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){
        config.enableSimpleBroker("/api/subscribe", "/queue"); // 구독(브로드캐스트)용 prefix
        config.setApplicationDestinationPrefixes("/api/publish"); // 클라이언트에서 서버로 발행하는 메시지의 prefix
        config.setUserDestinationPrefix("/api/user"); // 사용자별 메시지 라우팅을 위한 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws-connect") // 초기 핸드셰이크 과정에서 사용할 endpoint 지정
            .setAllowedOrigins(
                "http://127.0.0.1:5173",
                "http://localhost:5173",
                "https://127.0.0.1:5173",
                "https://localhost:5173",
                "http://127.0.0.1:5174",
                "http://localhost:5174",
                "https://127.0.0.1:5174",
                "https://localhost:5174",
                "http://127.0.0.1:5500",
                "http://i12d204.p.ssafy.io",
                "https://i12d204.p.ssafy.io",
                "https://overthecam.site",
                "http://overthecam.site"
            )
            .withSockJS() // SockJS 지원 추가
            .setStreamBytesLimit(512 * 1024)  // 스트리밍 시 한 번에 처리할 수 있는 최대 바이트 수
            .setHttpMessageCacheSize(1000)    // HTTP 스트리밍 시 캐시할 수 있는 최대 메시지 수
            .setDisconnectDelay(30 * 1000);   // 연결 종료 시 실제로 리소스를 해제하기까지 기다리는 시간

    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
        registration.taskExecutor()
            .corePoolSize(2)
            .maxPoolSize(4);
    }


    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(64 * 1024)
            .setSendTimeLimit(20 * 1000)
            .setSendBufferSizeLimit(512 * 1024);
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);

        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(new ObjectMapper());
        converter.setContentTypeResolver(resolver);

        messageConverters.add(converter);
        return false;
    }
}
