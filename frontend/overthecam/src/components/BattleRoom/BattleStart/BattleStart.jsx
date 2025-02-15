import BattleVote from "../common/BattleVote";
import BattleChating from "../common/BattleChating";
import { useState } from "react";

function BattleStart({ remoteTracks }) {
  const battler1Video = null;
  const battler2Video = null;
  const watcherSlots = null;
  const [voteTitle, setVoteTitle] = useState("ㅋㅋ 오늘 저녁 뭐먹지 ㅋㅋ ");
  const [voteOption1, setVoteOption1] = useState("싸이딥치즈");
  const [voteOption2, setVoteOption2] = useState("굶어라 걍 뭔 저녁이냐");

  return (
    <div className="battle-start-container w-full">
      <div className="battle-start-content max-w-7xl mx-auto">
        {/* 비디오 섹션 */}
        <div className="battler-section mx-5 my-3 h-[45vh]">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* 배틀러 1 */}
            <div className="flex flex-col">
              <div className="text-sm text-black rounded-t-lg p-1.5 bg-cusRed-light clay">
                배틀러1 닉네임
                <div className="relative w-full aspect-[4/3] bg-cusGray">
                  <div className="absolute inset-0 border rounded-lg flex items-center justify-center">
                    배틀러 화면
                  </div>
                </div>
              </div>
            </div>

            {/* 채팅 */}
            <div className="flex flex-col items-center justify-start">
              <div className="w-full h-full">
                <BattleChating />
              </div>
            </div>

            {/* 배틀러 2 */}
            <div className="flex flex-col">
              <div className="text-sm text-black rounded-t-lg p-1.5 bg-cusBlue-light clay">
                배틀러2 닉네임
                <div className="relative w-full aspect-[4/3] bg-cusGray">
                  <div className="absolute inset-0 border rounded-lg flex items-center justify-center">
                    배틀러 화면
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 시청자 섹션 */}
        <div className="watcher-section mx-5">
          <div className="relative w-full aspect-[16/1] bg-gray-100 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              시청자 자리
            </div>
          </div>
        </div>

        {/* 투표 섹션 */}
        <div className="vote-section mx-5 my-3">
          <div className="relative w-full aspect-[16/2.5] bg-cusGray rounded-lg clay">
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <BattleVote
                isWaiting={false}
                voteTitle={voteTitle}
                voteOption1={voteOption1}
                voteOption2={voteOption2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleStart;
