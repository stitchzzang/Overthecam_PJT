import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  return (
    <>
      <NavBar/>
      <main className="main-content">
        <Outlet /> {/* 여기에 각 페이지가 렌더링됨 */}
      </main>
      <footer>2025.copyright</footer>
    </>
  );
}

export default Layout;
