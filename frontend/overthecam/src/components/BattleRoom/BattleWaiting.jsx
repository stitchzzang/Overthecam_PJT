import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function WaitingRoom() {
  const { battleId } = useParams();
  const [roomName, setRoomName] = useState(""); // 방 이름
  const [roomMaster, setRoomMaster] = useState(""); // 방장

  // 방 id를 가지고 정보를 받아 온다
  useEffect(() => {
    // axios 요청
    setRoomName("방 이름");
    setRoomMaster("방장 이름");
  }, []);

  return (
    <div>
      <p>방번호: {battleId}</p>
      <h1>대기실: {roomName}</h1>
      <p>방장: {roomMaster}</p>
    </div>
  );
}

export default WaitingRoom;
