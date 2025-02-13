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

        </div>
        <div className="watcher-section">

        </div>
        <div className="vote-section w-full">
            <BattleVote/>
        </div>
      </div> 
    </div>
  );
}

export default BattleStart;
