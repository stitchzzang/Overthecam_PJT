import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  const location = useLocation();
  const getBackgroundColor = () => {
    if (location.pathname.startsWith("/battle-room")) {
      return "bg-gradient-to-b from-cusPink to-cusLightBlue";
    } else if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/find-account" ||
      location.pathname === "/create-battle-room"
    ) {
      return "bg-transparent";
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
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
