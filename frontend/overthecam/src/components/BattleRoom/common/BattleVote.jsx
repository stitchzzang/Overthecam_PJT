import { useState, useRef, useEffect } from "react";
import BattleVoteBettingModal from "../BattleStart/BattleStartModal/BattleVoteBettingModal";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import { useBattleStore } from "../../../store/Battle/BattleStore";

function BattleVote({ isWaiting }) {
  const [isVoted, setIsVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const bettingModal = useRef();
  const { vote, myRole } = useWebSocketContext();
  const [isBattler, setIsBattler] = useState(false);
  const battleInfo = useBattleStore((s) => s.battleInfo);

  const handleVote = (optionId) => {
    console.log(optionId);
    setSelectedOptionId(optionId);
    bettingModal.current?.showModal();
  };

  useEffect(() => {
    if (
      myRole === "HOST_BATTLER" ||
      myRole === "BATTLER" ||
      myRole === "PARTICIPANT_BATTLER"
    ) {
      setIsBattler(true);
    } else {
      setIsBattler(false);
    }
  }, []);
  
  // 배틀방 안에서 띄울 투표 시스템
  return (
    <div className="w-full h-32 bg-cusGray rounded-lg clay flex items-center justify-center">
      <div className="py-3 bg-white h-24 w-[calc(100%-24px)] rounded-lg flex">
        {/* 투표 버튼 */}
        {isWaiting ? (
          <>
            {/* 투표 제목 */}
            <div className="w-2/3 ml-5  flex flex-col items-center justify-center text-center item-center">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-800">
                  {vote.title}
                </h1>
                <h4>{vote.content}</h4>
              </div>
            </div>
            <div className="flex flex-col justify-center mx-10 gap-1 w-1/3">
              <button
                onClick={() => handleVote(vote.option1Id)}
                disabled={true}
                className={
                  "option1 btn py-2 px-6 !rounded-xl text-lg font-medium bg-cusRed text-white transition-all duration-300 disabled:cursor-not-allowed"
                }
              >
                {vote.option1}
              </button>
              <button
                onClick={() => handleVote(vote.option2Id)}
                disabled={true}
                className={
                  "option1 btn py-2 px-6 !rounded-xl text-lg font-medium bg-cusBlue text-white transition-all duration-300 disabled:cursor-not-allowed"
                }
              >
                {vote.option2}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 투표 제목 */}
            <div className="w-1/3 ml-5  flex flex-col items-center justify-center text-center item-center">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-800">
                  {vote.title}
                </h1>
                <h4>{vote.content}</h4>
              </div>
            </div>
            <div className="flex justify-between mx-10 gap-6 w-2/3">
              <button
                onClick={() => handleVote(vote.option1Id)}
                disabled={isBattler}
                className={
                  "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusRed text-white transition-all duration-300 disabled:cursor-not-allowed"
                }
              >
                {vote.option1}
              </button>
              <button
                onClick={() => handleVote(vote.option2Id)}
                disabled={isBattler}
                className={
                  "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusBlue text-white transition-all duration-300 disabled:cursor-not-allowed"
                }
              >
                {vote.option2}
              </button>
            </div>
          </>
        )}

        <BattleVoteBettingModal
          ref={bettingModal}
          battleId={battleInfo.battleId}
          optionId={selectedOptionId}
        />
      </div>
    </div>
  );
}

export default BattleVote;
