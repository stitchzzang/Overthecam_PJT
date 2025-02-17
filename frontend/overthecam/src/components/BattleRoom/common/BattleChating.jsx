import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import { useState, useRef, useEffect } from "react";

const BattleChating = ({outHeight, innerHeight}) => {
  const [inputMessage, setInputMessage] = useState("");
  const { status, sendMessage, messageList } = useWebSocketContext();
  const [connectStatus, setConnectStatus] = useState("DISCONNECTED");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage || status !== "CONNECTED") {
      return;
    }

    sendMessage(trimmedMessage);
    setInputMessage("");
  };

  // 최신 메세지 스크롤 바닥 고정 =
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  useEffect(() => {
    setConnectStatus(status);
  }, [status]);

  return (
    <div
      className={`w-full max-w-md ${outHeight} bg-cusGray rounded-lg clay flex flex-col p-1`}
    >
      {/* 채팅 헤더 */}
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-lg font-semibold text-cusBlack-light">
          실시간 채팅
        </h2>
        <span
          className={`text-sm ${
            connectStatus === "CONNECTED" ? "text-green-500" : "text-red-500"
          }`}
        >
          {connectStatus === "CONNECTED" ? "연결됨" : "연결 중..."}
        </span>
      </div>

      {/* 채팅 메시지 영역 */}
      <div
        className={`mx-2 bg-white rounded-md  ${innerHeight} overflow-hidden flex flex-col mb-2`}
      >
        <div
          className="flex-1 p-4 overflow-y-auto h-96 
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-white
          [&::-webkit-scrollbar-track]:rounded-md
          [&::-webkit-scrollbar-thumb]:bg-gray-500 
          [&::-webkit-scrollbar-thumb]:rounded-md
          [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
        >
          {messageList.length > 0 ? (
            <ul className="space-y-2 w-full">
              {messageList.map((msg, index) => (
                <li key={index} className="flex flex-col items-start">
                  {msg.nickname === "SYSTEM" ? (
                    <>
                      {" "}
                      <span className="text-sm text-red-700">
                        {msg.nickname}
                      </span>
                      <span className="text-sm text-red-900 max-w-36 font-semibold">
                        {" "}
                        {msg.content}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-700">
                        {msg.nickname}
                      </span>
                      <span className="text-sm text-gray-900 max-w-36 font-semibold">
                        {" "}
                        {msg.content}
                      </span>
                    </>
                  )}
                </li>
              ))}
              <div ref={messagesEndRef} />
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
