import { useState, useRef } from "react";
import BattleVoteBettingModal from "../BattleStart/BattleStartModal/BatlleVoteBettingModal";

function BattleVote({ isWaiting, voteTitle, voteDetail, voteOption1, voteOption2 }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const bettingModal = useRef();

  const handleVote = (option) => {
    bettingModal.current?.showModal();  
    // 여기에 투표 API 호출 등의 로직 추가
    // 성공하면 재투표 막기 
    // setSelectedOption(option);
  };
  // 배틀방 안에서 띄울 투표 시스템
  return (
    <div className="p-6 bg-white w-full h-full">
      {/* 투표 제목 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{voteTitle}</h1>
      </div>

      <div className="my-3 text-center">
        <h4>{voteDetail}</h4>
      </div>

      {/* 투표 버튼 */}
      {isWaiting ? (
        <></>
      ) : (
        <div className="flex justify-between mx-10 gap-6">
          <button
            onClick={() => handleVote("option1")}
            disabled={selectedOption !== null}
            className={
              "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusRed text-white transition-all duration-300"
            }
          >
            {voteOption1}
          </button>
          <button
            onClick={() => handleVote("option2")}
            disabled={selectedOption !== null}
            className={
              "option1 btn w-[45%] py-4 px-6 !rounded-xl text-lg font-medium bg-cusBlue text-white transition-all duration-300"
            }
          >
            {voteOption2}
          </button>
        </div>
      )}
      <BattleVoteBettingModal ref={bettingModal}/>
    </div>
  );
}

export default BattleVote;
