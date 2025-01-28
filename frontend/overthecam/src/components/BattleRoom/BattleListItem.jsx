import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../service/BattleRoom/api";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

function BattleListItem(props) {
  const navigate = useNavigate();

  const gotoBattleRoom = async (sessionId) => {
    try {
      const token = await getToken(); // await로 토큰 값 받아오기

      navigate(`/battle-room/${sessionId}`, {
        state: {
          sessionId: sessionId,
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
      <button onClick={() => gotoBattleRoom(props.sessionId)}>입장하기</button>
    </div>
  );
}

export default BattleListItem;
