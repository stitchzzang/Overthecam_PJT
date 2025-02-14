import { Outlet } from "react-router-dom";

function BattleRoomLayout() {
  return (
    <div className="flex flex-col h-screen">
      <main
        className={`flex-grow bg-gradient-to-b from-cusPink to-cusLightBlue flex-1 scrollbar-hide overflow-y-auto transition-all`}
      >
        <Outlet /> {/* 여기에 각 페이지가 렌더링됨 */}
      </main>
    </div>
  );
}

export default BattleRoomLayout;