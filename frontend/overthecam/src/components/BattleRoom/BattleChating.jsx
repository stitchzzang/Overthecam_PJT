import React, { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const WebSocketChat = () => {
  const [subscriptions, setSubscriptions] = useState({});
  const [messages, setMessages] = useState([]);
  const [url, setUrl] = useState(`${import.meta.env.VITE_BASE_URL}/ws-connect`);
  const [token, setToken] = useState(`${import.meta.env.VITE_TOKEN}`);
  const [destination, setDestination] = useState("/chat/1");
  const [message, setMessage] = useState("");
  const [chatId, setChatId]= useState(1);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // connectWebSocket();
    // subscribeToChannel();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const addMessage = (msg, nickname) => {
    setMessages(prev => [...prev, {
      content: msg,
      nickname: nickname
    }]);
  };

  const connectWebSocket = () => {
    if (!url || !token) {
      console.log("토큰, url 입력해주세요")
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
          subscribeToErrors(stomp);
        },
        onStompError: (frame) => {
          console.error("Broker reported error:", frame.headers["message"]);
          console.error("Additional details:", frame.body);
        },
        onWebSocketError: (error) => {
          console.error("WebSocket 연결 오류:", error);
        },
      });

      stomp.activate();
    } catch (error) {
      console.error("WebSocket 연결 중 예외 발생:", error);
    }
  };
  // 에러 알림 구독, onConnect 내부에서 호출됨
  const subscribeToErrors = (client) => {
    const errorSubscription = client.subscribe(
      "/api/user/queue/errors",
      (response) => {
        try {
          const errorResponse = JSON.parse(response.body);
          console.log(errorResponse.message);
        } catch (parseError) {
          console.log("에러 응답 파싱 실패");
        }
      }
    );
    setSubscriptions((prev) => ({ ...prev, errors: errorSubscription }));
  };

  const subscribeToChannel = () => {
    const client = stompClientRef.current;
    if (!client) {
      return;
    }

    const subscriptionPath = destination.startsWith("/api/subscribe")
      ? destination
      : `/api/subscribe${destination}`;

    const subscription = client.subscribe(subscriptionPath, (response) => {
      try {
        // 구독을 통해서 브로드캐스팅하는 메시지를 받음
        const responseDto = JSON.parse(response.body);
        console.log(responseDto)
        addMessage(responseDto.data.content, responseDto.data.nickname);
      } catch (parseError) {
        console.log("응답 파싱 실패");
      }
    });

    setSubscriptions((prev) => ({ ...prev, [subscriptionPath]: subscription }));
  };

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (!client) {
      console.log("연결이 되어있지 않습니다.");
      return;
    }

    try {
      const messageObj = {
        "battleId":chatId,
        "content": message,
        "timestamp": new Date().toISOString()
      }
      const sendPath = destination.startsWith("/api/publish")
        ? destination
        : `/api/publish${destination}`;

      client.publish({
        destination: sendPath,
        body: JSON.stringify(messageObj),
      });

    } catch (error) {
      console.log("유효하지 않은 메시지 형식입니다.");
    }

    setMessage("");
  };

  const disconnectWebSocket = () => {
    const client = stompClientRef.current;
    if (client) {
      client.deactivate();
      stompClientRef.current = null;
      console.log("WebSocket 연결 해제");
    }
  };

  return (
    <div id="chating-box">
      <h2>WebSocket 채팅</h2>
      <div id="show-chat">
        <div>
          <h3>메시지 로그</h3>
          <ul>
            {messages.map((msg, index) => (
              <li
                key={index}
              >
                {msg.nickname}:<strong>{msg.content}</strong>
              </li>
            ))}
          </ul>
        </div>
      <input
          type="text"
          placeholder="인증 토큰"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={connectWebSocket}>연결</button>
        <button onClick={disconnectWebSocket}>연결 해제</button>
        <button onClick={subscribeToChannel}>구독</button>
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요."
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default WebSocketChat;
