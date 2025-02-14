import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const BattleChating = () => {
  const [subscriptions, setSubscriptions] = useState({});
  const [messages, setMessages] = useState([]);
  const [destination, setDestination] = useState("/chat/1");
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(1);

  useEffect(() => {
    // connectWebSocket();
    // subscribeToChannel();

    return () => {
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

  const sendMessage = (e) => {
    e.preventDefault();

    // 빈 메시지 체크
    if (!message.trim()) {
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

  return (
    <div className="w-full max-w-md h-full bg-cusGray rounded-lg clay flex flex-col p-1">
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

export default BattleChating;
