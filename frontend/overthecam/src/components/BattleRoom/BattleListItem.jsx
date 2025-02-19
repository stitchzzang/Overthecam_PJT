import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../service/BattleRoom/api";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";

function BattleListItem({ title, totalUsers, thumbnail, status, battleId }) {
  const navigate = useNavigate();
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state) => state.userNickname);

  const gotoBattleRoom = async (battleId) => {
    console.log(battleId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/main/login");
        return;
      }

      const response = await joinRoom(battleId, userNickname);
      await new Promise((resolve) => {
        const newBattleInfo = {
          battleId: response.data.battleId,
          participantName: userNickname,
          roomName: response.data.roomName,
          userToken: response.data.token,
          isMaster: false,
        };

        setBattleInfo(newBattleInfo);
        // 다음 렌더링 사이클에서 resolve 호출
        requestAnimationFrame(resolve);
      });

      // 3. 페이지 이동
      navigate(`/main/battle-room/${battleId}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
      navigate("/main/battle-list");
    }
  };

  return (
    <div className="battle-list-item flex bg-white rounded-lg h-[140px] m-2 clay p-3">
      <div className="w-[120px] flex items-center justify-center">
        <img
          src={thumbnail}
          alt="배틀방 썸네일"
          className="w-[110px] h-[110px] object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 flex flex-col px-6">
        <div className="flex-1 flex items-center mb-1">
          <h3 className="text-lg font-semibold line-clamp-1 text-black">
            {title ? title : "방제 없음"}
          </h3>
        </div>
        <div className="flex justify-between items-center gap-4 mb-1">
          <span className="text-cusBlue font-bold">{totalUsers}/6</span>
          {status === "WAITING" ? (
            totalUsers >= 6 ? (
              <button className="btn px-4 sm:px-6 py-2 bg-cusGray text-white font-bold rounded-lg pointer-events-none whitespace-nowrap">
                <span className="sm:inline hidden">입장 불가</span>
                <span className="sm:hidden">만석</span>
              </button>
            ) : (
              <button
                className="btn px-4 sm:px-6 py-2 bg-gradient-to-r from-cusPink to-cusLightBlue hover:from-cusLightBlue hover:to-cusPink text-black font-bold rounded-lg whitespace-nowrap"
                onClick={() => gotoBattleRoom(battleId)}
              >
                <span className="sm:inline hidden">입장하기</span>
                <span className="sm:hidden">입장</span>
              </button>
            )
          ) : (
            <button className="btn px-4 sm:px-6 py-2 bg-cusGray text-white font-bold rounded-lg pointer-events-none whitespace-nowrap">
              <span className="sm:inline hidden">진행 중</span>
              <span className="sm:hidden">진행</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleListItem;
