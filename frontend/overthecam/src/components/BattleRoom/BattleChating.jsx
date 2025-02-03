import React, { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const BattleChatting = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [url, setUrl] = useState("http://i12d204.p.ssafy.io/api/ws-connect");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const stompClientRef = useRef(null);

  const connectWebSocket = () => {
    if (!token || !username) {
      alert("토큰과 사용자 이름을 입력하세요");
      return;
    }

    const socket = new SockJS(url);
    const stomp = Stomp.over(socket);

    stomp.configure({
      connectHeaders: { 
        Authorization: `Bearer ${token.replace("Bearer ", "")}`
      },
      onConnect: () => {
        stompClientRef.current = stomp;
        
        stomp.subscribe("/api/subscribe/chat/1", (message) => {
          const chatMessage = JSON.parse(message.body);
          // 현재 사용자가 보낸 메시지가 아닌 경우만 추가
          if (chatMessage.sender !== username) {
            setChatMessages(prev => [...prev, {
              sender: chatMessage.sender,
              content: chatMessage.content,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        });
      },
      onStompError: (error) => {
        console.error("연결 오류:", error);
      }
    });

    stomp.activate();
  };

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (!client || !inputMessage.trim()) return;

    client.publish({
      destination: "/api/publish/chat/1",
      body: JSON.stringify({
        content: inputMessage,
        sender: username
      })
    });

    setInputMessage("");
  };

  return (
    <div>
      <div style={{ height: "400px", overflowY: "scroll", border: "1px solid #ccc" }}>
        {chatMessages.map((msg, index) => (
          <div key={index} style={{ 
            padding: "10px", 
            borderBottom: "1px solid #eee",
            backgroundColor: "#f0f0f0"
          }}>
            <strong>{msg.sender}</strong>
            <span style={{ marginLeft: "10px", color: "gray", fontSize: "0.8em" }}>
              {msg.timestamp}
            </span>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div>
        <input 
          type="text" 
          placeholder="사용자 이름" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="인증 토큰" 
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={connectWebSocket}>연결</button>
      </div>
      <div>
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지 입력"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default BattleChatting;