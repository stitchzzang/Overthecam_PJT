import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { JoinRoom } from "../../service/BattleRoom/api";

function BattleListItem({battleId, BattleName}) {
  const navigate = useNavigate();

  const gotoBattleRoom = async (battleId) => {
    console.log(battleId)
    try {
       const response = await JoinRoom(battleId);
       console.log(response.data)
      navigate(`/battle-room/${battleId}`, {
        state: {
          battleId: response.data.battleId,
          title: response.data.title,
          sessionId: response.data.sessionId,
          connectionToken: response.data.connectionToken,
          isMaster: false,
        },
      });
    } catch (error) {
      console.error("Battle room navigation error:", error);
      // 에러 처리 (예: 알림 표시)
    }
  };

  return (
    <div>
      <p>{BattleName}</p>
      <button onClick={() => gotoBattleRoom(battleId)}>입장하기</button>
    </div>
  );
}

export default BattleListItem;
