import { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const WebSocketChat = () => {
  const [subscriptions, setSubscriptions] = useState({});
  const [messages, setMessages] = useState([]);
  const [url, setUrl] = useState(`${import.meta.env.VITE_BASE_URL}/ws-connect`);
  const [token, setToken] = useState(`${import.meta.env.VITE_TOKEN}`);
  const [destination, setDestination] = useState("/chat/1");
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(1);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // connectWebSocket();
    // subscribeToChannel();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const addMessage = (msg, nickname) => {
    setMessages((prev) => [
      ...prev,
      {
        content: msg,
        nickname: nickname,
      },
    ]);
  };

  const connectWebSocket = () => {
    if (!url || !token) {
      console.log("토큰, url 입력해주세요");
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
        console.log(responseDto);
        addMessage(responseDto.data.content, responseDto.data.nickname);
      } catch (parseError) {
        console.log("응답 파싱 실패");
      }
    });

    setSubscriptions((prev) => ({ ...prev, [subscriptionPath]: subscription }));
  };

  const sendMessage = (e) => {
    e.preventDefault();

    // 빈 메시지 체크
    if (!message.trim()) {
      return;
    }

    const client = stompClientRef.current;
    if (!client) {
      console.log("연결이 되어있지 않습니다.");
      return;
    }

    try {
      const messageObj = {
        battleId: chatId,
        content: message.trim(), // 앞뒤 공백 제거
        timestamp: new Date().toISOString(),
      };
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
    <div className="w-full max-w-md h-full bg-cusGray rounded-lg clay flex flex-col my-10 p-1">
      {/* 채팅 헤더 */}
      <div className="flex justify-start px-4 py-2">
        <h2 className="text-lg font-semibold text-cusBlack-light">
          실시간 채팅
        </h2>
      </div>

      {/* 채팅 메시지 영역 - flex-1로 남은 공간 차지 */}
      <div className="flex-1 mx-2 bg-white rounded-md overflow-hidden flex flex-col mb-2">
        <div
          className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-gray-800 
                    [&::-webkit-scrollbar-thumb]:bg-gray-500 
                    [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <ul className="space-y-2">
            {messages.map((msg, index) => (
              <li key={index} className="flex space-x-2 items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-400">{msg.nickname}</div>
                  <div className="mt-1 p-2 bg-gray-700 rounded-lg">
                    {msg.content}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-2 mb-2">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder=" 메시지를 입력하세요."
            className="flex-1 py-2 bg-white focus:outline-none border-none rounded-lg text-sm mr-1"
          />
          <button className="clay px-4 py-1.5 bg-cusBlue-light text-white rounded-lg transition-colors">
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WebSocketChat;
