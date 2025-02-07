import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../service/BattleRoom/api";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

function BattleCreatingPage() {
  const [battleTitle, setBattleTitle] = useState("");
  const navigate = useNavigate();

  const createBattleRoomHandler = async (title) => {
    setBattleTitle(title)
    try {
      const response = await createRoom(battleTitle);
      console.log(response)
      navigate(`/battle-room/${response.data.battleId}`, {
        state: {
          battleId: response.data.battleId,
          title: response.data.title,
          sessionId: response.data.sessionId,
          connectionToken: response.data.connectionToken,
          isMaster: true,
        },
      });
      console.log(state)
    } catch (error) {
      console.error("Battle room navigation error:", error);
      // 에러 처리 (예: 알림 표시)
    }
  };

  return (
    <div>
      <CursorMotionEffect/>
      <h1>방 만들기</h1>
      <p>지금 바로 배틀 방을 만들고 논쟁을 즐겨보세요!</p>
      <BattleCreateForm onCreateRoom={createBattleRoomHandler}/>
    </div>
  );
}

export default BattleCreatingPage;
