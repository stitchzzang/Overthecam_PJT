import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";

function BattleMainPage() {
  const [battles, setBattles] = useState([]);
  const [battleId, setbattleId] = useState('1234');

  return (
    <>
      <Link to={"/create-battle-room"}>방만들기</Link>
      <h1>Battle Main Page</h1>
      <div>
        <p>배틀 방 정보가 담긴 컴포넌트 목록 배열</p>
        {/* battles.map((post)=> <BattlePost key={post.id}/>) */}
        <Link to={`/battle-room/${battleId}`}>입장하기기</Link>
      </div>
    </>
  );
}

export default BattleMainPage;
