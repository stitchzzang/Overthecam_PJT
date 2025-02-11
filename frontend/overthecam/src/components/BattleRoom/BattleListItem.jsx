import { useNavigate } from "react-router-dom";
import { JoinRoom } from "../../service/BattleRoom/api";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";

function BattleListItem({ title, totalUsers, thumbnail, status, battleId }) {
  const navigate = useNavigate();
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state)=>state.userNickname)

  const gotoBattleRoom = async (battleId) => {
    console.log(battleId);
    try {
      const response = await JoinRoom(battleId, userNickname);

      const newBattleInfo = {
        battleId: response.data.battleId,
        participantName: userNickname,
        roomName: response.data.roomName,
        userToken: response.data.token,
        isMaster: true,
      };
      setBattleInfo(newBattleInfo);
      navigate(`/battle-room/${battleId}`)
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
        {/* 제목 영역 */}
        <div className="flex-1 flex flex-col items-start my-5 mx-2 justify-start">
          <h3
            className={`text-xl font-semibold mx-3 my-2 max-w-full text-left text-black leading-tight ${
              title ? "line-clamp" : "text-gray-400"
            }`}
          >
            {title ? title : "방제 없음"}
          </h3>
        </div>
        {/* 하단 버튼 영역 */}
        <div className="flex justify-between items-center px-5 pb-5">
          <p className="text-lg font-semibold text-cusBlue">{totalUsers}/6</p>
          {status === 0 ? (
            <button
              className="btn bg-cusRed-light hover:bg-cusRed w-32 h-11"
              onClick={() => gotoBattleRoom(battleId)}
            >
              입장하기
            </button>
          ) : (
            <button className="btn-disabled bg-cusBlue-light w-32 h-11">
              진행중
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleListItem;
