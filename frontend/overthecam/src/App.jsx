import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";
import Layout from "./components/Layout/Layout";
import BattleMainPage from "./page/BattleRoom/BattleMainPage";
import BattleCreatingPage from "./page/BattleRoom/BattleCreatingPage";
import BattleRoomPage from "./page/BattleRoom/BattleRoomPage";
import ItemShopPage from "./page/ItemShop/ItemShopPage";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import FindAccount from "./components/Login/FindAccount";
import MyPage from "./page/Mypage/MyPage.jsx";
import OtherUserPage from "./page/Mypage/OtherUserPage.jsx";
import MyPageReport from "./page/Mypage/MypageReport.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/battle-list" element={<BattleMainPage />} />
          <Route path="/create-battle-room" element={<BattleCreatingPage />} />
          <Route path="/battle-room/:battleId" element={<BattleRoomPage />} />
          <Route path="/store" element={<ItemShopPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-account" element={<FindAccount />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/other-user/:userId" element={<OtherUserPage />} />
          <Route path="/mypagereport" element={<MyPageReport />} />
          {/* <Route path="/mypagevote" element={<MyPageVote />} />
          <Route path="/mypagebattle" element={<MyPageBattle />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
