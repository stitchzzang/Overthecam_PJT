import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../service/BattleRoom/testApi";

function BattleListItem(props) {
  const navigate = useNavigate();

  const gotoBattleRoom = async (battleId) => {
    try {
      const token = await getToken(battleId); // await로 토큰 값 받아오기
      //   const url = `/battle-room/${sessionId}?isMaster=false&token=${encodeURIComponent(
      //     token
      //   )}`;
      //   window.open(url, "_blank", "noopener,noreferrer");

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
