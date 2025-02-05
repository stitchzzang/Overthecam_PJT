import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../service/BattleRoom/testApi";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";

function BattleCreatingPage() {
  const [battleId, setBattleId] = useState(""); // 배틀방 아이디(번호)
  const navigate = useNavigate();

  const createBattleRoomHandler = async (event) => {
    event.preventDefault();

    try {
      console.log("방을 생성 합니다");
      const token = await getToken();
      navigate(`/battle-room/${battleId}`, {
        state: {
          sessionId: battleId,
          isMaster: true,
          token: token,
        },
      });
    } catch (error) {
      console.error("Battle room navigation error:", error);
      // 에러 처리 (예: 알림 표시)
    }
  };

  return (
    <div>
      <h1>방 만들기</h1>
      <p>지금 바로 배틀 방을 만들고 논쟁을 즐겨보세요!</p>
      <BattleCreateForm onCreateRoom={createBattleRoomHandler}/>
    </div>
  );
}

export default BattleCreatingPage;
