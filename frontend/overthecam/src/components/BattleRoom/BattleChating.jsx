import { useEffect, useRef, useState } from "react";
import { Client,Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function BattleChating({ onDisconnect }) {
  const stompClient = useRef(null);
  const [myUserName, setMyUserName] = useState(""); // 사용자 이름
  const [chatRoomId, setChatRoomId] = useState(1); // 채팅방 번호
  const [currentSubscription, setCurrentSubscription] = useState(null); // 현재 구독 객체 저장
  const [chat, setChat] = useState(""); // 입력 받을 대화 내용
  const [chatList, setChatList] = useState([]); // 채팅 기록

  const SOKET_BASE_URL = "http://i12d204.p.ssafy.io/api";
  const CON_ENDPOINT = "/chat/rooms/";
  const PUB_ENDPOINT = "/publish/chat/";
  const SUB_ENDPOINT = "/subscribe/chat/";

  useEffect(() => {
  // 첫 마운트 시 웹 소켓 연결
  const soket = new SockJS(`${SOKET_BASE_URL}${CON_ENDPOINT}${chatRoomId}`);
  stompClient.current = Stomp.over(soket);

    stompClient.current.connect({}, () => {
      console.log("webSoket 연결 성공!");
      stompClient.current?.subscribe(`${SUB_ENDPOINT}${chatRoomId}`, (message) => {
        const chatMessage = JSON.parse(message.body);
        console.log("새 메세지 수신", chatMessage);
        displayMessage(message.body);
      });
    }, (error) => {
      console.error("webSoket 연결 실패", error);
    });

    // 언마운트할 때 해제
    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, []);


  const displayMessage = (newMessage) => {
    setChatList((prev) => [...prev, newMessage]);
  };

  const sendMessage = (battleId, username, content) => {
    if (stompClient.current && stompClient.current.connected) {
      const message = {
        battleId,
        username,
        content,
        timestamp: new Date().toISOString()
      };
      stompClient.send(`${PUB_ENDPOINT}${battleId}`, {}, JSON.stringify(message));
    }
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
