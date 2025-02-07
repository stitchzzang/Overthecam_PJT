import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { JoinRoom } from "../../service/BattleRoom/api";

function BattleListItem({ title, totalUsers, thumbnail, status, battleId }) {
  const navigate = useNavigate();

  const gotoBattleRoom = async (battleId) => {
    console.log(battleId);
    try {
      const response = await JoinRoom(battleId);
      console.log(response.data);
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
    <div className="battle-list-item flex bg-cusLightBlue-light rounded-lg clay">
      <img
        src={thumbnail}
        alt="배틀방 썸네일"
        className="w-1/3 object-cover rounded-tl-lg rounded-bl-lg"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1 p-10 flex flex-col items-start">
          <h3
            className={
              title
                ? "text-xl font-semibold mb-3"
                : "text-xl font-semibold mb-3 text-gray-400"
            }
          >
            {title ? title : "방제 없음"}
          </h3>
          <p className="text-lg font-semibold text-cusBlue mt-3">
            {totalUsers}/6
          </p>
        </div>
        <div className="flex justify-end p-10">
          {status === 0 ? (
            <button
              className="btn bg-cusRed-light w-32"
              onClick={() => gotoBattleRoom(battleId)}
            >
              입장하기
            </button>
          ) : (
            <button className="btn-disabled w-32">진행중</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleListItem;
