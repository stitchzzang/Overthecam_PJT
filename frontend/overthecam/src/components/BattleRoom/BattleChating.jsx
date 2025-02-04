import React, { useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const WebSocketChat = () => {
  const [subscriptions, setSubscriptions] = useState({});
  const [messages, setMessages] = useState([]);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [destination, setDestination] = useState("/chat/1");
  const [message, setMessage] = useState("");
  const stompClientRef = useRef(null);

  const addMessage = (msg, type) => {
    setMessages((prev) => [...prev, { text: msg, type }]);
  };

  const connectWebSocket = () => {
    if (!url || !token) {
      addMessage("URL과 토큰을 모두 입력해주세요.", "error");
      return;
    }

    try {
      const socket = new SockJS(url);
      const stomp = Stomp.over(socket);

      stomp.configure({
        connectHeaders: {
          Authorization: `Bearer ${token.replace("Bearer ", "")}`,
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("Connected successfully:", frame);
          stompClientRef.current = stomp;
          addMessage("WebSocket 연결 성공", "success");
          subscribeToErrors(stomp);
        },
        onStompError: (frame) => {
          console.error("Broker reported error:", frame.headers["message"]);
          console.error("Additional details:", frame.body);
          addMessage(`연결 실패: ${frame.headers["message"]}`, "error");
        },
        onWebSocketError: (error) => {
          console.error("WebSocket 연결 오류:", error);
          addMessage("WebSocket 연결 실패", "error");
        },
      });

      stomp.activate();
    } catch (error) {
      console.error("WebSocket 연결 중 예외 발생:", error);
      addMessage("WebSocket 연결 중 오류 발생", "error");
    }
  };

  const subscribeToErrors = (client) => {
    const errorSubscription = client.subscribe(
      "/api/user/queue/errors",
      (response) => {
        try {
          const errorResponse = JSON.parse(response.body);
          addMessage(errorResponse.message || "알 수 없는 오류", "error");
        } catch (parseError) {
          addMessage("에러 응답 파싱 실패", "error");
        }
      }
    );
    setSubscriptions((prev) => ({ ...prev, errors: errorSubscription }));
  };

  const subscribeToChannel = () => {
    const client = stompClientRef.current;
    if (!client) {
      addMessage("WebSocket 연결이 되어있지 않습니다.", "error");
      return;
    }

    const subscriptionPath = destination.startsWith("/api/subscribe")
      ? destination
      : `/api/subscribe${destination}`;

    const subscription = client.subscribe(subscriptionPath, (response) => {
      try {
        const responseDto = JSON.parse(response.body);
        addMessage(responseDto.message || "메시지 수신", "success");
      } catch (parseError) {
        addMessage("응답 파싱 실패", "error");
      }
    });

    setSubscriptions((prev) => ({ ...prev, [subscriptionPath]: subscription }));
  };

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (!client) {
      addMessage("WebSocket 연결이 되어있지 않습니다.", "error");
      return;
    }

    try {
      const messageObj = JSON.parse(message);
      const sendPath = destination.startsWith("/api/publish")
        ? destination
        : `/api/publish${destination}`;

      client.publish({
        destination: sendPath,
        body: JSON.stringify(messageObj),
      });

      addMessage(`메시지 전송: ${messageObj.content}`, "info");
    } catch (error) {
      addMessage("유효하지 않은 메시지 형식", "error");
    }
  };

  const disconnectWebSocket = () => {
    const client = stompClientRef.current;
    if (client) {
      client.deactivate();
      stompClientRef.current = null;
      addMessage("WebSocket 연결 해제", "info");
    }
  };

  return (
    <div>
      <h2>WebSocket 채팅</h2>
      <div>
        <input
          type="text"
          placeholder="WebSocket URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="인증 토큰"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={connectWebSocket}>연결</button>
        <button onClick={disconnectWebSocket}>연결 해제</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="구독 경로"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button onClick={subscribeToChannel}>구독</button>
      </div>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="JSON 메시지 입력"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
      <div>
        <h3>메시지 로그</h3>
        <ul>
          {messages.map((msg, index) => (
            <li
              key={index}
              style={{
                color:
                  msg.type === "error"
                    ? "red"
                    : msg.type === "success"
                    ? "green"
                    : "black",
              }}
            >
              {msg.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketChat;
