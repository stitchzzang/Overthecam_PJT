import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import "./index.css";
import Layout from "./components/Layout/Layout";
import FakeMainPage from "./page/Main/FakeMainPage";
import BattleMainPage from "./page/Main/BattleMainPage";
import BattleCreatingPage from "./page/BattleRoom/BattleCreatingPage";
import BattleRoomPage from "./page/BattleRoom/BattleRoomPage";
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
import BattleRoomLayout from "./components/Layout/BattleRoomLayOut.jsx";
import { WebSocketProvider } from "./hooks/useWebSocket.jsx";
import { useBattleStore } from "./store/Battle/BattleStore.jsx";

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

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/main/login", { state: { from: location.pathname } });
    }
  }, [isLoggedIn, navigate, location]);

  return isLoggedIn ? children : null;
}

function App() {
  const battleInfo = useBattleStore(s => s.battleInfo)
  return (
    <Router>
      <Routes>
        {/* 랜딩 페이지 */}
        <Route path="/" element={<FakeMainPage />} />

        {/* 네비게이션바 필요 없는 라우터 */}
        <Route element={<BattleRoomLayout />}>
          <Route
            path="/battle-room/:battleId"
            element={
              <PrivateRoute>
                <WebSocketProvider battleId={battleInfo.battleId}>
                  <BattleRoomPage />
                </WebSocketProvider>
              </PrivateRoute>
            }
          />
        </Route>

        {/* 메인 레이아웃과 라우트들 */}
        <Route path="/main" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="search" element={<SearchResultPage />} />
          <Route path="battle-list" element={<BattleMainPage />} />
          <Route
            path="create-battle-room"
            element={
              <PrivateRoute>
                <BattleCreatingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="create-vote"
            element={
              <PrivateRoute>
                <VoteCreatingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="store"
            element={
              <PrivateRoute>
                <ItemShopPage />
              </PrivateRoute>
            }
          />
          <Route
            path="mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="mypagereport"
            element={
              <PrivateRoute>
                <MyPageReport />
              </PrivateRoute>
            }
          />
          <Route
            path="mypagebattle"
            element={
              <PrivateRoute>
                <MyPageBattle />
              </PrivateRoute>
            }
          />
          <Route
            path="mypagevote"
            element={
              <PrivateRoute>
                <MyPageVote />
              </PrivateRoute>
            }
          />
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
  );
}

export default App;
