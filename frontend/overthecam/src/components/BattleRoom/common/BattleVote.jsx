function BattleVote({ isWaiting }) {
  // 배틀방 안에서 띄울 투표 시스템
  return (
    <div>
      <div>
        <h1>투표 제목</h1>
      </div>
      {isWaiting ? (
        <></>
      ) : (
        <div className="flex">
          <button>옵션 1 </button>
          <button>옵션 2</button>
        </div>
      )}
    </div>
  );
}

export default BattleVote;
