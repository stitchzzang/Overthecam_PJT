import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <NavBar />
      <main className="flex-grow bg-cusGray scrollbar-hide overflow-y-auto transition-all mt-20">
        <Outlet /> {/* 여기에 각 페이지가 렌더링됨 */}
      </main>
    </div>
  );
}

export default Layout;
