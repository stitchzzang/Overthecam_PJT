import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";
import { createRoom } from "../../service/BattleRoom/api";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

function BattleCreatingPage() {
  const navigate = useNavigate();
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state) => state.userNickname);
  const [roomTitle, setRoomTitle] = useState("");

  const createBattleRoomHandler = async (e) => {
    e.preventDefault();

    try {
      // store에 배틀 정보 저장하기 전에 데이터 확인
      console.log("Storing battle info:", {
        userNickname: userNickname,
        roomTitle: roomTitle,
      });

      setBattleInfo({
        userNickname: userNickname,
        roomTitle: roomTitle,
      });

      // store 업데이트 후 상태 확인
      const currentState = useBattleStore.getState();
      console.log("Current store state:", currentState);

      // 다른 페이지로 이동
      navigate(`/battle-room/${roomTitle}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
    }
  };
  return (
    <>
      <div className="flex bg-white rounded-lg h-max-70vh w-max-70vh shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]">
        <div className="w-1/2 overflow-hidden">
          <CursorMotionEffect />
        </div>
        <div className="flex flex-col w-1/2  items-center justify-center min-h-screen">
          <div className="flex flex-col items-center justify-center text-center space-y-4 m-5">
            <h1 className="text-3xl font-semibold">방 만들기</h1>
            <p className="text-lg">방을 만들고 지금 바로 논쟁을 즐겨보세요!</p>
          </div>
          <BattleCreateForm />
        </div>
      </div>
    </>
  );
}

export default BattleCreatingPage;
