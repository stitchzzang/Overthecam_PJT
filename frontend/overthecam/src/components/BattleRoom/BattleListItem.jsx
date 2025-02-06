import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

function BattleListItem(props) {
  const navigate = useNavigate();

  const gotoBattleRoom = async (battleId) => {
    try {
      const token = await getToken(battleId); // await로 토큰 값 받아오기
      navigate(`/battle-room/${battleId}`, {
        state: {
          sessionId: battleId,
          isMaster: false,
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
      <p>{props.BattleName}</p>
      <button onClick={() => gotoBattleRoom(props.battleId)}>입장하기</button>
    </div>
  );
}

export default BattleListItem;
