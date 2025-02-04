import { createRoot } from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import HeaderLayout from "./components/Layout/HeaderLayout.jsx";
import BattleCreate from "./page/BattleRoom/BattleCreatingPage.jsx";
import BattleWaiting from "./page/BattleRoom/BattleRoomPage.jsx";
import BattleMainPage from "./page/BattleRoom/BattleMainPage.jsx";
import ItemShopPage from "./page/ItemShop/ItemShopPage.jsx";
import Login from "./components/Login/Login.jsx";
import Signup from "./components/Login/Signup.jsx";
import FindAccount from "./components/Login/FindAccount.jsx";
import NavBar from "./components/Layout/NavBar";
import MyPage from "./page/Mypage/MyPage.jsx";
import OtherUserPage from "./page/Mypage/OtherUserPage.jsx";
import MyPageReport from "./page/Mypage/MypageReport.jsx";
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/battle-list",
    element: (
      <HeaderLayout>
        <BattleMainPage />
      </HeaderLayout>
    ),
  },
  {
    path: "/create-battle-room",
    element: (
      <HeaderLayout>
        <BattleCreate />
      </HeaderLayout>
    ),
  },
  { path: "/battle-room/:battleId", element: <BattleWaiting /> },
  {
    path: "/store",
    element: (
      <HeaderLayout>
        <ItemShopPage />
      </HeaderLayout>
    ),
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/find-account", element: <FindAccount /> },
  { path: "/mypage", element: <MyPage /> },
  { path: "/other-user/:userId", element: <OtherUserPage /> },
  { path: "/mypagereport", element: <MyPageReport /> },
  // { path: "/mypagevote", element: <MyPageVote /> },
  // { path: "/mypagebattle", element: <MyPageBattle /> },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
