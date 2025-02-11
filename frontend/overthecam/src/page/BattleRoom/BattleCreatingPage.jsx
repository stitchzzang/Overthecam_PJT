import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";
import { createRoom } from "../../service/BattleRoom/api";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";
import { useEffect } from "react";

function BattleCreatingPage() {
  const navigate = useNavigate();
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state) => state.userNickname);

  useEffect(() => {
    console.log("현재 userNickname:", userNickname);
  }, [userNickname]);

  const createBattleRoomHandler = async (title) => {
    try {
      // store에 배틀 정보 저장하기 전에 데이터 확인
      console.log("Storing battle info:", {
        userNickname: userNickname,
        roomTitle: title,
      });
      const response = await createRoom(title, userNickname);
      console.log("방 생성 결과: ", response.data.token);
      const token = response.data.token;

      // 저장하기 전 값들 확인
      console.log("저장할 값들:", {
        participantName: userNickname,
        roomName: title,
        userToken: token,
        isMaster: true,
      });

      setBattleInfo({
        participantName: userNickname,
        roomName: title, // roomTitle 대신 roomName 사용
        userToken: token, // token 대신 userToken 사용
        isMaster: true,
      });

      // store 업데이트 후 상태 확인
      const currentState = useBattleStore.getState();
      console.log("Current store state:", currentState);

      // 다른 페이지로 이동
      navigate(`/battle-room/${title}`);
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
          <BattleCreateForm onCreateRoom={createBattleRoomHandler} />
        </div>
      </div>
    </>
  );
}

export default BattleCreatingPage;
