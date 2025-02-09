import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";
import Layout from "./components/Layout/Layout";
import BattleMainPage from "./page/Main/BattleMainPage";
import BattleCreatingPage from "./page/BattleRoom/BattleCreatingPage";
import BattleRoomPage from "./page/BattleRoom/BattleRoomPage";
import VoteCreatingPage from "./page/Vote/VoteCreatingPage.jsx";
import VoteInProgressPage from "./page/Vote/VoteInProgressPage.jsx";
import VoteClosedPage from "./page/Vote/VoteClosedPage.jsx";
import VoteDetailPage from "./page/Vote/VoteDetailPage.jsx";
import VoteDeleteModal from "./components/Vote/VoteDeleteModal.jsx";
import ItemShopPage from "./page/ItemShop/ItemShopPage";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import FindAccount from "./components/Login/FindAccount";
import MyPage from "./page/Mypage/MyPage.jsx";
import UserProfile from "./page/Mypage/UserProfile.jsx";
import MyPageReport from "./page/Mypage/MyPageReport.jsx";
import MainPage from "./page/Main/MainPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Layout />}>
          <Route path="/battle-list" element={<BattleMainPage />} />
          <Route path="/create-battle-room" element={<BattleCreatingPage />} />
          <Route path="/battle-room/:battleId" element={<BattleRoomPage />} />
          <Route path="/create-vote" element={<VoteCreatingPage />} />
          <Route path="/vote-inprogress" element={<VoteInProgressPage />} />
          <Route path="/vote-closed" element={<VoteClosedPage />} />
          <Route path="/vote-detail/:voteId" element={<VoteDetailPage />} />
          <Route path="/delete-vote/:voteId" element={<VoteDeleteModal />} />
          <Route path="/store" element={<ItemShopPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-account" element={<FindAccount />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/user-profile/me" element={<UserProfile />} />
          <Route path="/user-profile/:id" element={<UserProfile />} />
          <Route path="/mypagereport" element={<MyPageReport />} />
          <Route path="/mypagebattle" element={<MyPageBattle />} />
          <Route path="/mypagevote" element={<MyPageVote />} />
        </Route>
      </Routes>
    </Router>


  )
}

export default App

