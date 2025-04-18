import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import "./index.css";
import Layout from "./components/Layout/Layout";
import FakeMainPage from "./page/Main/FakeMainPage";
import BattleMainPage from "./page/Main/BattleMainPage";
import BattleCreatingPage from "./page/BattleRoom/BattleCreatingPage";
import BattleRoomLoader from "./page/BattleRoom/BattleRoomLoader.jsx";
import VoteCreatingPage from "./page/Vote/VoteCreatingPage.jsx";
import VoteDetailPage from "./page/Vote/VoteDetailPage.jsx";
import ItemShopPage from "./page/ItemShop/ItemShopPage";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import FindAccount from "./components/Login/FindAccount";
import MyPage from "./page/Mypage/MyPage.jsx";
import UserProfile from "./page/Mypage/UserProfile.jsx";
import MyPageReport from "./page/Mypage/MyPageReport.jsx";
import MainPage from "./page/Main/MainPage.jsx";
import MyPageBattle from "./page/Mypage/MyPageBattle.jsx";
import MyPageVote from "./page/Mypage/MyPageVote.jsx";
import VotePage from "./page/Vote/VotePage.jsx";
import OtherProfile from "./page/Mypage/OtherProfile";
import SearchResultPage from "./page/Main/SearchResultPage.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedLogin() {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/main");
    }
  }, [isLoggedIn, navigate]);

  return !isLoggedIn ? <Login /> : null;
}

// PrivateRoute 컴포넌트 수정
function PrivateRoute() {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/main/login", { state: { from: location.pathname } });
    }
  }, [isLoggedIn, navigate, location]);

  return isLoggedIn ? <Outlet /> : null;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* 랜딩 페이지 */}
          <Route path="/" element={<FakeMainPage />} />

          {/* 메인 레이아웃과 관련 라우트들 */}
          <Route path="/main" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="search" element={<SearchResultPage />} />
            <Route path="battle-list" element={<BattleMainPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="create-battle-room" element={<BattleCreatingPage />} />
              <Route
                path="battle-room/:battleId"
                element={<BattleRoomLoader />}
              />
              <Route path="create-vote" element={<VoteCreatingPage />} />
              <Route path="store" element={<ItemShopPage />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="mypagereport" element={<MyPageReport />} />
              <Route path="mypagebattle" element={<MyPageBattle />} />
              <Route path="mypagevote" element={<MyPageVote />} />
            </Route>

            {/* Public Routes */}
            <Route path="vote" element={<VotePage />} />
            <Route path="vote-detail/:voteId" element={<VoteDetailPage />} />
            <Route path="login" element={<ProtectedLogin />} />
            <Route path="signup" element={<Signup />} />
            <Route path="find-account" element={<FindAccount />} />
            <Route path="user-profile/:id" element={<UserProfile />} />
            <Route path="profile/:id" element={<OtherProfile />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
