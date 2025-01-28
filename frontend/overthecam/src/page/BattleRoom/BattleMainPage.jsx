import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";

import BattleListItem from "../../components/BattleRoom/BattleListItem";

function BattleMainPage() {
  const [battles, setBattles] = useState([
    {
      id: 1234,
      sessionId: "session-1234",
      BattleName: "깻잎 논쟁쟁",
    },
    {
      id: 2345,
      sessionId: "session-2345",
      BattleName: "피자 vs 치킨킨",
    },
  ]);

  const nickName = "고구마감자구황작물";
  const sessionId = "session-1234";

  return (
    <>
      <Link to={"/create-battle-room"}>방만들기</Link>
      <h1>Battle Main Page</h1>
      <div>
        <p>배틀 방 정보가 담긴 컴포넌트 목록 배열</p>
        {battles.map((post) => (
          <BattleListItem
            key={post.id}
            sessionId={post.sessionId}
            BattleName={post.BattleName}
          />
        ))}
      </div>
    </>
  );
}

export default BattleMainPage;
