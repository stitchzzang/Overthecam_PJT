import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function BattleChating({ onDisconnect }) {
  const stompClient = useRef(null);
  const [myUserName, setMyUserName] = useState(""); // 사용자 이름
  const [chatRoomId, setChatRoomId] = useState(1); // 채팅방 번호
  const [currentSubscription, setCurrentSubscription] = useState(null); // 현재 구독 객체 저장장
  const [chat, setChat] = useState(""); // 입력 받을 대화 내용
  const [chatList, setChatList] = useState([]); // 채팅 기록

  const SOKET_BASE_URL = new SockJS("/api");
  const CON_ENTPOINT = "/chat/rooms/";
  const PUB_ENDPOINT = "/publish/chat/";
  const SUB_ENDPOINT = "/subscribe/chat/";

  useEffect(() => {
    // 새로운 STOMP 클라이언트 생성
    const client = new Client({
      webSocketFactory: () => {
        console.log("Creating WebSocket connection to:", `${SOKET_BASE_URL}${CON_ENTPOINT}`);
        return `${SOKET_BASE_URL}${CON_ENTPOINT}${chatRoomId}`;
      },
      onConnect: () => {
        console.log("WebSocket 연결 성공!");
        // 채팅방 입장
        enterRoom();
      },
      onDisconnect: () => {
        console.log("WebSocket 연결 해제!");
      },
      onStompError: (frame) => {
        console.error("Broker reported error:", frame.headers['message']);
        console.error("Additional details:", frame.body);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error observed:", event);
      },
      debug: (str) => {
        console.log("STOMP debug:", str);
      },
    });

    stompClient.current = client;
    client.activate();

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (stompClient.current) {
        console.log("Deactivating WebSocket connection");
        stompClient.current.deactivate();
      }
    };
  }, []);

  // 부모 컴포넌트에서 호출할 수 있도록 onDisconnect 함수 설정
  useEffect(() => {
    if (onDisconnect) {
      onDisconnect(() => {
        if (stompClient.current) {
          console.log("Deactivating WebSocket connection from onDisconnect");
          stompClient.current.deactivate();
        }
      });
    }
  }, [onDisconnect]);

  // 채팅방 입장 함수 추가
  const enterRoom = () => {
    if (!isNaN(chatRoomId) && chatRoomId > 0) {
      // 기존 구독 시 취소
      if (currentSubscription) {
        currentSubscription.unsubscribe();
      }

      const newSubscription = stompClient.subscribe(
        `${SUB_ENDPOINT}${chatRoomId}`,
        (response) => {
          try {
            const message = JSON.parse(response.body);
            displayMessage(message);
            console.log("subscrbe to ", path);
          } catch (error) {
            console.error("Message parsing error", error);
          }
        }
      );

      setCurrentSubscription(newSubscription);
    }
  };

  const displayMessage = (newMessage) => {
    setChatList((prev) => [...prev, newMessage]);
  };

  const sendMessage = (roomId, userName, content) => {
    const message = {
      battleId: roomId,
      username: userName,
      content: content,
      timestamp: new Date().toISOString(),
    };

    stompClient.send(
      `${PUB_ENDPOINT}${chatRoomId}`,
      {},
      JSON.stringify(message)
    );
  };

  const sendChat = (event) => {
    console.log("채팅을 보냅니다.", chat);
    event.preventDefault();
    // 채팅 내용 publish
    sendMessage(chatRoomId, myUserName, chat);
    setChat("");
  };

  // 입력되는 chat 값을 상태 관리 계속 업뎃
  const handleChatChange = (event) => {
    setChat(event.target.value);
  };

  // 엔터키 = 보내지게
  const handleOnKeyDown = (event) => {
    if (event.key.toLowerCase() === "enter") {
      sendChat(event);
    }
  };

  return (
    <div>
      <p>실시간 채팅</p>
      <div>
        <div>
          {/* 채팅 대화 기록 보여주기 css로 지정 크기 넘어가면 스크롤하게 수정할 것 */}
          {chatList.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
        <div>
          {/* 채팅 입력창 */}
          <input
            type="text"
            placeholder="내용을 입력하세요..."
            onChange={handleChatChange}
            onKeyDown={handleOnKeyDown}
            value={chat}
          />
          <input type="button" value="보내기" onClick={sendChat} />
        </div>
      </div>
    </div>
  );
}

export default BattleChating;
