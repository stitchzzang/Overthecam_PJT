package com.overthecam.websocket.interceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompConnectHandler implements ChannelInterceptor {

    @Override
    public void postSend(Message message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String sessionId = accessor.getSessionId();

        switch ((accessor.getCommand())) {
            case CONNECT:

                // 유저가 Websocket으로 connect()를 한 뒤 호출됨
                log.debug("StompCommand.CONNECT 요청 수신 - sessionId: {}, destination: {}", accessor.getDestination(), sessionId);
                break;

            case DISCONNECT:

                // 유저가 Websocket으로 disconnect() 를 한 뒤 호출됨 or 세션이 끊어졌을 때 발생
                log.debug("StompCommand.DISCONNECT 요청 수신 - sessionId: {}, destination: {}", accessor.getDestination(), sessionId);
                break;

            default:

                break;
        }

    }
}
