import BattleVote from "../common/BattleVote";

function BattleStart({ remoteTracks }) {
  const battler1Video = null;
  const battler2Video = null;
  const watcherSlots = null;

  return (
    <div
      className="battle-start-container w-full flex flex-col"
      style={{ height: "calc(100vh - 2rem)" }}
    >
      <div className="battle-start-content">
        <div className="battler-section">
            <div className="flex"> 비디오 섹션
                <div>
                    선택지 1 비디오 자리
                    {/* 내가 배틀러 1이면 여기에 상점 버튼 */}
                </div>
                <div>
                    타이머 + 채팅 자리
                    {/* 게임 시작하면 자동으로 타이머 */}
                    {/* 타이머에 시간 구매 설정 */}
                    {/* 채팅자리 비워놓기? */}
                </div>
                <div>
                    선택지 2 비디오 자리
                    {/* 내가 배틀러 2이면 여기에 상점 버튼 */}
                </div>
            </div>
        </div>
        <div className="watcher-section">
            <div>
                시청자 자리
            </div>
        </div>
        <div className="vote-section w-full">
            <BattleVote/>
            {/* 옵션 누르면 배팅 모달 */}
        </div>
      </div> 
    </div>
  );
}

export default BattleStart;
