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

  const createBattleRoomHandler = async (roomName) => {
    try {
      const response = await createRoom(roomName, userNickname);

      const newBattleInfo = {
        battleId: response.data.battleId,
        participantName: userNickname,
        roomName: roomName,
        userToken: response.data.token,
        isMaster: true,
      };

      console.log("저장할 결과: ", newBattleInfo);

      setBattleInfo(newBattleInfo);

      // 4. store가 제대로 업데이트 되었는지 확인
      const updatedState = useBattleStore.getState();
      console.log("Updated store state:", updatedState);
      navigate(`/main/battle-room/${response.data.battleId}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
      navigate('/main/battle-list');
    }
  };
  return (
    <div className="flex justify-center mt-16">
      <div className="flex bg-white rounded-lg h-[600px] w-max-70vh shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]">
        <div className="w-1/2 overflow-hidden">
          <CursorMotionEffect />
        </div>
        <div className="flex flex-col w-1/2 items-center justify-center h-full py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4">
            <h1 className="text-3xl font-semibold">방 만들기</h1>
            <p className="text-lg">방을 만들고 지금 바로 논쟁을 즐겨보세요!</p>
          </div>
          <BattleCreateForm onCreateRoom={createBattleRoomHandler} />
        </div>
      </div>
    </div>
  );
}

export default BattleCreatingPage;
