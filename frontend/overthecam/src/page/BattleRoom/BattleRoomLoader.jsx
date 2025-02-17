import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import WebSocketProvider from "../../hooks/useWebSocket";
import BattleRoomPage from "../BattleRoom/BattleRoomPage";

function BattleRoomLoader() {
  const battleInfo = useBattleStore((s) => s.battleInfo);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    if (battleInfo.battleId) {
      setIsLoading(false);
    } else {
      // 5초 후에도 battleInfo가 없으면 리스트로 이동
      timeoutId = setTimeout(() => {
        if (!battleInfo.battleId) {
          navigate("/main/battle-list");
        }
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [battleInfo, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cusRed"></div>
          <p className="text-gray-600">배틀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider battleId={battleInfo.battleId}>
      <BattleRoomPage />
    </WebSocketProvider>
  );
}

export default BattleRoomLoader;
