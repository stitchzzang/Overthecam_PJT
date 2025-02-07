import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../service/BattleRoom/api";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

function BattleCreatingPage() {
  const navigate = useNavigate();

  const createBattleRoomHandler = async (title) => {
    try {
      // title을 직접 사용하여 createRoom 호출
      const response = await createRoom(title);
      console.log(response);

      navigate(`/battle-room/${response.data.battleId}`, {
        state: {
          battleId: response.data.battleId,
          title: response.data.title,
          sessionId: response.data.sessionId,
          connectionToken: response.data.connectionToken,
          isMaster: true,
        },
      });

      console.log(response.data); // 여기서 state 로그 확인
    } catch (error) {
      console.error("Battle room navigation error:", error);
      // 에러 처리 (예: 알림 표시)
    }
  };

  return (
    <div className="m-10">
      <div className="w-full h-screen bg-white flex items-center justify-center pr-10 relative">
        {/* 커서 모션 효과 영역 */}
        <div className="w-1/2 h-full flex justify-center items-center">
          <CursorMotionEffect />
        </div>

        {/* 폼 영역 */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center pl-8">
          <h1 className="text-3xl font-bold mb-4 text-center">방 만들기</h1>
          <p className="text-lg mb-6 text-center">
            지금 바로 배틀 방을 만들고 논쟁을 즐겨보세요!
          </p>
          <BattleCreateForm onCreateRoom={createBattleRoomHandler} />
        </div>
      </div>
    </div>
  );
}

export default BattleCreatingPage;
