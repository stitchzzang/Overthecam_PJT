import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // 로그인 상태 체크 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    
    console.log("로그인 상태 체크:", {
      token,
      userInfoStr
    });
    
    if (token && userInfoStr) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(userInfoStr));
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  // 컴포넌트 마운트 및 location 변경 시 로그인 상태 체크
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  // localStorage 변경 이벤트 리스너
  useEffect(() => {
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    // 로그아웃 시 모든 관련 데이터 삭제
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    
    // 상태 초기화
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsProfileDropdownOpen(false);
    
    // 홈으로 이동
    navigate("/");
  };

  if (isBattleRoomPage) {
    return null;
  }

  return (
    <>
      <header className="h-[80px] mb-4">
        <div className="max-w-7xl mx-auto h-full px-3 relative flex items-center">
          {/* Left Section - Logo */}
          <div className="flex justify-start items-center w-1/6">
            <button
              className="text-4xl bg-transparent hover:bg-transparent border-none focus:outline-none text-cusBlue w-[60px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
            <Link to={"/"}>
              <img
                src="/images/Logo.png"
                alt="Logo"
                className="ml-4 w-3/4 h-3/4"
                // style={{ width: "auto", maxWidth: "160px" }}
              />
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          <div className="absolute left-1/2 transform -translate-x-1/2 min-w-[550px]">
            <SearchBar />
          </div>

          {/* Right Section with Create Buttons and Profile */}
          <div className="flex items-center justify-end gap-6 w-1/4 ml-auto">
            {isLoggedIn && userInfo ? (
              <>
                <div className="flex flex-col gap-2">
                  <Link
                    to={"/create-battle-room"}
                    className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center w-32"
                  >
                    방 만들기
                  </Link>
                  <Link
                    to={"/create-vote"}
                    className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center w-32"
                  >
                    투표 만들기
                  </Link>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="text-gray-700 whitespace-nowrap text-sm">
                      {userInfo.nickname} 님,
                      <br />
                      안녕하세요!
                    </span>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/mypage"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <aside
        className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto z-40`}
      >
        <div className="p-4">
          {/* Action buttons */}
          <div className="flex flex-col gap-2 mb-6">
            <Link
              to={"/create-battle-room"}
              className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
            >
              방 만들기
            </Link>
            <Link
              to={"/create-vote"}
              className="btn px-6 py-2  bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
            >
              투표 만들기
            </Link>
          </div>

          {/* Menu items */}
          <div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
            >
              투표
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="ml-4">
                <Link
                  to={"/vote-inprogress"}
                  className="block p-2 hover:bg-gray-100 rounded"
                >
                  진행중인 투표
                </Link>
                <Link
                  to={"/vote-closed"}
                  className="block p-2 hover:bg-gray-100 rounded"
                >
                  종료된 투표
                </Link>
              </div>
            )}
          </div>
          
          <Link
            to={"/store"}
            className="block text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
          >
            상점
          </Link>
        </div>
      </aside>
    </>
  );
}