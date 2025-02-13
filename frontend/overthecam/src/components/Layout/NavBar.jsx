import { useEffect, useState, useRef } from "react";
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
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);  // 모바일용 ref 추가
  const sidebarRef = useRef(null);  // 사이드바용 ref 추가

  // Zustand store 사용
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const userNickname = userStore.userNickname ? userStore.userNickname : null;

  // 로그인 상태 체크 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    
    try {
      if (token && userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        if (parsedUserInfo && parsedUserInfo.nickname) {
          // 디코딩 로직 제거
          console.log("로그인 상태 체크:", {
            token,
            isLoggedIn,
            nickname: parsedUserInfo.nickname,
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

  // 외부 클릭 감지를 위한 useEffect 수정
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setIsMobileProfileDropdownOpen(false);
      }
      // 사이드바 외부 클릭 처리 추가
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="menu"]')) {  // 햄버거 버튼 클릭은 제외
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // localStorage 데이터 삭제
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
    
    // Zustand store 상태 초기화
    useUserStore.setState({ 
      isLoggedIn: false, 
      userNickname: null,
      userId: null 
    });
    
    // UI 상태 초기화
    setIsProfileDropdownOpen(false);
    setIsMobileProfileDropdownOpen(false);
    
    // 홈으로 이동
    navigate("/");
  };

  if (isBattleRoomPage) {
    return null;
  }

  return (
    <>
      <header className="h-[80px] mb-4">
        <div className="max-w-7xl mx-auto h-full px-3 relative flex items-center justify-between">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-2">
            <button
              className="text-4xl bg-transparent hover:bg-transparent border-none focus:outline-none text-cusBlue w-[50px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="menu"
            >
              ☰
            </button>
            <Link to={"/"}>
              <img
                src="/images/Logo.png"
                alt="Logo"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden xl:block max-w-[550px] flex-1 mx-8">
            <SearchBar />
          </div>

          {/* Right Section */}
          <div className="hidden xl:flex items-center gap-6">
            {isLoggedIn && userNickname ? (
              <>
                <div className="flex flex-col gap-2">
                  <Link
                    to={"/create-battle-room"}
                    className="btn px-4 xl:px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-32"
                  >
                    <span>방 만들기</span>
                  </Link>
                  <Link
                    to={"/create-vote"}
                    className="btn px-4 xl:px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-32"
                  >
                    <span>투표 만들기</span>
                  </Link>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
                    <Link
                      to="/mypage"
                      className="flex items-center gap-6"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src="" 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="whitespace-nowrap">
                        <span className="font-bold">{userNickname}</span> 님,
                        <br />
                        안녕하세요!
                      </span>
                    </Link>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="ml-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-[50%] translate-x-[50%] mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/mypagereport"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        논쟁 분석 리포트
                      </Link>
                      <Link
                        to="/mypagebattle"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        배틀 관리
                      </Link>
                      <Link
                        to="/mypagevote"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        투표 관리
                      </Link>
                      <Link
                        to="/mypage/edit"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        회원 정보 수정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-sm font-bold text-cusRed hover:bg-gray-100 rounded text-center"
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
      <div className="xl:hidden px-3 mb-4">
        <SearchBar />
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-[120px] h-[calc(100vh-120px)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto z-40`}
      >
        <div className="p-4">
          {/* Mobile Only - Login/Signup/Profile */}
          <div className="xl:hidden mb-6">
            {isLoggedIn && userNickname ? (
              <div className="flex flex-col gap-2" ref={mobileDropdownRef}>
                <div className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
                  <Link
                    to="/mypage"
                    className="flex items-center gap-6"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src="" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      <span className="font-bold">{userNickname}</span> 님,
                      <br />
                      안녕하세요!
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                    className="ml-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
                
                {isMobileProfileDropdownOpen && (
                  <div className="mt-2 bg-white rounded-md shadow-lg py-1">
                    <Link
                      to="/mypagereport"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                    >
                      논쟁 분석 리포트
                    </Link>
                    <Link
                      to="/mypagebattle"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                    >
                      배틀 관리
                    </Link>
                    <Link
                      to="/mypagevote"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                    >
                      투표 관리
                    </Link>
                    <Link
                      to="/mypage/edit"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                    >
                      회원 정보 수정
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 text-sm font-bold text-cusRed hover:bg-gray-100 rounded text-center"
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