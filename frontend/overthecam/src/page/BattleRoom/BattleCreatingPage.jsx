import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BattleCreateForm from "../../components/BattleRoom/BattleCreatingForm";

function BattleCreatingPage() {
  const [battleId, setBattleId] = useState(''); // 배틀방 아이디(번호)
  const navigate = useNavigate();

  function createBattle() {
    // post 방 생성
    // post 방장 부여
    // post 방 id
    // post 방 제목
    const newBattleId = "1234";
    return newBattleId;
  }

  const createBattleRoomHandler = async (event) => {
    event.preventDefault();
    // createBattle() 호출
    // 방 생성 후 방 아이디 받아오기
    const newBattleId = await createBattle();
    console.log("방을 생성 합니다");
    setBattleId(newBattleId)
  }
  useEffect(()=>{
    if (battleId) {
      // battle-room/:battleId 로 이동
      navigate(`/battle-room/${battleId}`);
    }
  }, [battleId])
  
  return (
    <div>
      <h1>방 만들기</h1>
      <p>지금 바로 배틀 방을 만들고 논쟁을 즐겨보세요!</p>
      <BattleCreateForm onCreateRoom={createBattleRoomHandler} />
    </div>
  );
}

export default BattleCreatingPage;
