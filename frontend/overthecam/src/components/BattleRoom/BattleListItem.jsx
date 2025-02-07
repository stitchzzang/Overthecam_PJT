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
    <div className="battle-list-item flex bg-white rounded-lg max-h-48 m-5 clay">
      <img
        src={thumbnail}
        alt="배틀방 썸네일"
        className="w-1/3 object-cover rounded-tl-lg rounded-bl-lg"
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-start my-5 mx-2 jsutify-center">
          <h3
            className={
              title
                ? "text-xl font-semibold mb-3"
                : "text-xl font-semibold mb-3 text-gray-400"
            }
          >
            {title ? title : "방제 없음"}
          </h3>
        </div>
          <p className="flex justify-end text-lg font-semibold text-cusBlue mr-5">
            {totalUsers}/6
          </p>
        <div className="flex justify-end p-5">
          {status === 0 ? (
            <button
              className="btn bg-cusRed-light hover:bg-cusRed w-32"
              onClick={() => gotoBattleRoom(battleId)}
            >
              입장하기
            </button>
          ) : (
            <button className="btn-disabled bg-cusBlue-light w-32">진행중</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleListItem;
