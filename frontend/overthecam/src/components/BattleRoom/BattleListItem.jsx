import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../service/BattleRoom/api";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";

function BattleListItem({ title, totalUsers, thumbnail, status, battleId }) {
  const navigate = useNavigate();
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state)=>state.userNickname)

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
       navigate(`/battle-room/${battleId}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
      navigate('/main/battle-list');
    }
  };

  return (
    <div className="battle-list-item flex bg-white rounded-lg h-[140px] m-2 clay p-3">
      <div className="w-32 flex items-center justify-center">
        <img
          src={thumbnail}
          alt="배틀방 썸네일"
          className="w-28 h-28 object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 flex flex-col px-4">
        {/* 제목 영역 */}
        <div className="flex-1 flex items-center mb-6">
          <h3 className="text-lg font-semibold line-clamp-1 text-black">
            {title ? title : "방제 없음"}
          </h3>
        </div>
        {/* 하단 버튼 영역 */}
        <div className="flex justify-end items-center gap-3 -mt-3 mb-2">
          <span className="btn px-4 py-1.5 text-sm font-bold bg-cusGray-light text-cusBlack pointer-events-none">
            {totalUsers} / 6
          </span>
          {status === "WAITING" ? (
            <button
              className="btn bg-cusRed-light hover:bg-cusRed w-[120px] h-10"
              onClick={() => gotoBattleRoom(battleId)}
            >
              입장하기
            </button>
          ) : (
            <button className="btn-disabled bg-cusLightBlue w-[120px] h-10 text-white font-bold">
              진행 중
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleListItem;