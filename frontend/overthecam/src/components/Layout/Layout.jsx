import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  return (
    <>
      <NavBar />
      <main className="main-content bg-cusGray scrollbar-hide ">
        <Outlet /> {/* 여기에 각 페이지가 렌더링됨 */}
      </main>
      
    </>
  );
}

export default Layout;
