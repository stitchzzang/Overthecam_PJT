import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  const location = useLocation();
  const isBattleRoom = location.pathname.includes("/main/battle-room");

  const getBackgroundColor = () => {
    if (
      location.pathname === "/main/login" ||
      location.pathname === "/main/signup" ||
      location.pathname === "/main/find-account" ||
      location.pathname === "/main/create-battle-room" ||
      location.pathname === "/main/create-vote"
    ) {
      return "bg-transparent";
    } else if (isBattleRoom) {
      return "bg-gradient-to-b from-cusPink to-cusLightBlue flex-1 scrollbar-hide overflow-y-auto transition-al";
    }
  };
  return (
    <div className="flex flex-col h-screen">
      {!isBattleRoom && <NavBar />}
      <main
        className={`flex-grow ${
          getBackgroundColor() || "bg-cusGray"
        } scrollbar-hide overflow-y-auto transition-all`}
      >
        <Outlet /> {/* 여기에 각 페이지가 렌더링됨 */}
      </main>
    </div>
  );
}

export default Layout;
