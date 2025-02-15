import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import { useState } from "react";

const BattleChating = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { status, sendMessage, messageList } = useWebSocketContext();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage || status !== "CONNECTED") {
      return;
    }

    sendMessage(trimmedMessage);
    setInputMessage("");
  };

  return (
    <div className="w-full max-w-md h-full bg-cusGray rounded-lg clay flex flex-col p-1">
      {/* 채팅 헤더 */}
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-lg font-semibold text-cusBlack-light">
          실시간 채팅
        </h2>
        <span
          className={`text-sm ${
            status === "CONNECTED" ? "text-green-500" : "text-red-500"
          }`}
        >
          {status === "CONNECTED" ? "연결됨" : "연결 중..."}
        </span>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 mx-2 bg-white rounded-md overflow-hidden flex flex-col mb-2">
        <div
          className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-gray-800 
                    [&::-webkit-scrollbar-thumb]:bg-gray-500 
                    [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {messageList.length > 0 ? (
            <ul className="space-y-2">
              {messageList.map((msg, index) => (
                <li key={index} className="flex space-x-2 items-start">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">{msg.nickname}</div>
                    <div className="mt-1 p-2 bg-gray-700 rounded-lg text-white">
                      {msg.content}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              메시지가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-2 mb-2">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder=" 메시지를 입력하세요."
            className="flex-1 py-2 bg-white focus:outline-none border-none rounded-lg text-sm mr-1"
            disabled={status !== "CONNECTED"}
          />
          <button
            type="submit"
            disabled={status !== "CONNECTED"}
            className={`clay px-4 py-1.5 rounded-lg transition-colors ${
              status === "CONNECTED"
                ? "bg-cusBlue-light text-white hover:bg-cusBlue-dark"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BattleChating;
