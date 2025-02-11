import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import useUserStore from "../../store/User/UserStore";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);

  // Zustand store 사용
  const userStore = useUserStore.getState();
  const isLoggedIn = userStore.isLoggedIn;
  const userNickname = userStore.userNickname ? decodeURIComponent(escape(userStore.userNickname)) : null;

  // 로그인 상태 체크 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    
    try {
      if (token && userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        if (parsedUserInfo && parsedUserInfo.nickname) {
          // UTF-8로 디코딩
          const decodedNickname = decodeURIComponent(escape(parsedUserInfo.nickname));
          console.log("로그인 상태 체크:", {
            token,
            isLoggedIn,
            nickname: decodedNickname,
          });
        }
      }
    } catch (error) {
      console.error("유저 정보 파싱 에러:", error);
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
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    
    setIsProfileDropdownOpen(false);
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
          <div className="flex justify-start items-center lg:w-1/4 w-full">
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
                className="ml-4 h-12 w-auto"
              />
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden lg:block flex-1 max-w-[550px] mx-4">
            <SearchBar />
          </div>

          {/* Right Section with Create Buttons and Profile */}
          <div className="hidden lg:flex items-center justify-end gap-6 w-1/4 ml-auto">
            {isLoggedIn && userNickname ? (
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
                    className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src="/placeholder.svg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      <span className="font-bold">{userNickname}</span> 님,
                      <br />
                      안녕하세요!
                    </span>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/mypage"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        마이페이지
                      </Link>
                      <Link
                        to="/mypagereport"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        논쟁 분석 리포트
                      </Link>
                      <Link
                        to="/mypagebattle"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        배틀 관리
                      </Link>
                      <Link
                        to="/mypagevote"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        투표 관리
                      </Link>
                      <Link
                        to="/mypage/edit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        회원 정보 수정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
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

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-3 mb-4">
        <SearchBar />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[120px] h-[calc(100vh-120px)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto z-40`}
      >
        <div className="p-4">
          {/* Mobile Only - Login/Signup/Profile */}
          <div className="lg:hidden mb-6">
            {isLoggedIn && userNickname ? (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                  className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105 w-full"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="/placeholder.svg" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="whitespace-nowrap">
                    <span className="font-bold">{userNickname}</span> 님,
                    <br />
                    안녕하세요!
                  </span>
                </button>
                
                {/* 모바일 프로필 드롭다운 메뉴 */}
                {isMobileProfileDropdownOpen && (
                  <div className="mt-2 bg-gray-50 rounded-md overflow-hidden">
                    <Link
                      to="/mypage"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      마이페이지
                    </Link>
                    <Link
                      to="/mypagereport"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      논쟁 분석 리포트
                    </Link>
                    <Link
                      to="/mypagebattle"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      배틀 관리
                    </Link>
                    <Link
                      to="/mypagevote"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      투표 관리
                    </Link>
                    <Link
                      to="/mypage/edit"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      회원 정보 수정
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="btn px-4 py-2 bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="btn px-4 py-2 bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

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
              className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
            >
              투표 만들기
            </Link>
          </div>

          {/* Menu items */}
          <div className="flex flex-col gap-2">
            <Link
              to="/battle-list"
              className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
            >
              배틀 방 보기
            </Link>
            <Link
              to="/vote"
              className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
            >
              투표
            </Link>
            <Link
              to={"/store"}
              className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
            >
              상점
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}