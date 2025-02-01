import { useRef, useState } from "react";

function BattleChating() {
  const client = useRef({});
  const [chat, setChat] = useState(""); // 입력 받을 대화 내용
  const [chatList, setChatList] = useState([]); // 채팅 기록

  const connect = () => {
    try {
      // 소켓 연결
    } catch (error) {
      console.error("채팅 연결에 문제가 생겼습니다.", error);
    }
  };

  const sendChat = (event) => {
    console.log("채팅을 보냅니다.", chat);
    event.preventDefault();
    setChatList((prev)=>[...prev,chat])
    // client.current.publish({

    // })
    setChat("");
  };

  // 입력되는 chat 값을 상태 관리 계속 업뎃뎃
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
