import { useState, useRef } from "react";
import BattleVoteBettingModal from "../BattleStart/BattleStartModal/BattleVoteBettingModal";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import { useBattleStore } from "../../../store/Battle/BattleStore";

function BattleVote({ isWaiting }) {
  const [isVoted, setIsVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const bettingModal = useRef();
  const { vote } = useWebSocketContext();
  const battleInfo = useBattleStore(s=>s.battleInfo)

  const handleVote = (optionId) => {
    console.log(optionId)
    setSelectedOptionId(optionId);
    bettingModal.current?.showModal();
    // 여기에 투표 API 호출 등의 로직 추가
    // 성공하면 재투표 막기
  };
  // 배틀방 안에서 띄울 투표 시스템
  return (
    <div className="p-6 bg-white w-full h-full">
      {/* 투표 제목 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{vote.title}</h1>
      </div>

      <div className="my-3 text-center">
        <h4>{vote.content}</h4>
      </div>

      {/* 투표 버튼 */}
      {isWaiting ? (
        <></>
      ) : (
        <div className="flex justify-between mx-10 gap-6">
          <button
            onClick={() => handleVote(vote.option1Id)}
            disabled={isVoted}
            className={
              "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusRed text-white transition-all duration-300 disabled:cusor-none-all"
            }
          >
            {vote.option1}
          </button>
          <button
            onClick={() => handleVote(vote.option2Id)}
            disabled={isVoted}
            className={
              "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusBlue text-white transition-all duration-300"
            }
          >
            {vote.option2}
          </button>
        </div>
      )}
      <BattleVoteBettingModal
        ref={bettingModal}
        battleId={battleInfo.battleId}
        optionId={selectedOptionId}
      />
    </div>
  );
}

export default BattleVote;
