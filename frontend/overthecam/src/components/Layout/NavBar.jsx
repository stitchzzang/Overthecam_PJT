import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import useUserStore from "../../store/User/UserStore";
import 'remixicon/fonts/remixicon.css';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const sidebarRef = useRef(null);  // 사이드바용 ref 추가

  // Zustand store 사용
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const userNickname = userStore.userNickname ? userStore.userNickname : null;

  // localStorage 변경 감지를 위한 useEffect 수정
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const userInfoStr = localStorage.getItem("userInfo");
      
      console.log('NavBar - 토큰 체크:', !!token);
      console.log('NavBar - 유저정보 체크:', !!userInfoStr);
      
      if (!token || !userInfoStr) {
        // 토큰이나 유저정보가 없으면 로그아웃 상태로 변경
        useUserStore.setState({ 
          isLoggedIn: false, 
          userNickname: null,
          userId: null 
        });
        return;
      }

      try {
        // 토큰 유효성 검사 추가
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // 토큰이 만료되었는지 확인
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          console.log('NavBar - 토큰 만료됨');
          // 토큰 만료시 로그아웃 처리
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("userId");
          useUserStore.setState({ 
            isLoggedIn: false, 
            userNickname: null,
            userId: null 
          });
          return;
        }

        const parsedUserInfo = JSON.parse(userInfoStr);
        if (parsedUserInfo && parsedUserInfo.nickname) {
          useUserStore.setState({
            isLoggedIn: true,
            userNickname: parsedUserInfo.nickname,
            userId: parsedUserInfo.userId
          });
        }
      } catch (error) {
        console.error("NavBar - 유저 정보 파싱 에러:", error);
        // 파싱 에러 시에도 로그아웃 상태로
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userId");
        useUserStore.setState({ 
          isLoggedIn: false, 
          userNickname: null,
          userId: null 
        });
      }
    };

    // 컴포넌트 마운트 시 초기 체크
    checkLoginStatus();

    // localStorage 변경 이벤트 리스너
    window.addEventListener('storage', checkLoginStatus);
    
    // 주기적으로 토큰 상태 체크 (1초마다)
    const interval = setInterval(checkLoginStatus, 60000);
    
    // cleanup
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
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

  // 기존 useEffect들 아래에 추가
  useEffect(() => {
    // location이 변경될 때마다 메뉴 닫기
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    
    // UI 상태 초기화 - 모바일 상태도 함께 초기화
    setIsProfileDropdownOpen(false);
    setIsMobileProfileDropdownOpen(false);
    
    // 홈으로 이동
    navigate("/main");
  };

  if (isBattleRoomPage) {
    return null;
  }

  return (
    <>
      {/* SVG 필터는 최상단에 한 번만 정의 */}
      <svg className="fixed w-0 h-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix 
              in="blur" 
              type="matrix" 
              values="1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 19 -9"
            />
          </filter>
        </defs>
      </svg>

      <header className="h-[80px] mb-2 mt-6">
        <div className="max-w-7xl mx-auto h-full px-1 relative flex items-center justify-between">
          {/* Left Section - Logo & Menu Button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* 햄버거 버튼 */}
              <button
                className="text-4xl bg-transparent hover:bg-transparent border-none focus:outline-none text-cusBlue w-[40px] relative z-20"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="menu"
              >
                ☰
              </button>

              {/* 메뉴 아이템들 */}
              <div className="absolute left-0 top-[60px]" ref={sidebarRef}>
                {/* gooey 효과가 적용될 배경 버튼들 */}
                <div className="absolute left-0 top-0" style={{ filter: 'url(#gooey)', zIndex: 10 }}>
                  <div className={`absolute w-36 h-12 bg-cusBlue/90 rounded-full clay transition-all duration-500 ease-in-out shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] ${
                    isMenuOpen ? 'translate-y-[10px] opacity-100 scale-100' : 'translate-y-0 opacity-0 scale-95'
                  }`} />
                  <div className={`absolute w-36 h-12 bg-cusBlue/90 rounded-full clay transition-all duration-500 ease-in-out delay-[50ms] shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] ${
                    isMenuOpen ? 'translate-y-[75px] opacity-100 scale-100' : 'translate-y-0 opacity-0 scale-95'
                  }`} />
                  <div className={`absolute w-36 h-12 bg-cusBlue/90 rounded-full clay transition-all duration-500 ease-in-out delay-[100ms] shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] ${
                    isMenuOpen ? 'translate-y-[140px] opacity-100 scale-100' : 'translate-y-0 opacity-0 scale-95'
                  }`} />
                  <div className={`absolute w-36 h-12 bg-cusBlue/90 rounded-full clay transition-all duration-500 ease-in-out delay-[150ms] shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] ${
                    isMenuOpen ? 'translate-y-[205px] opacity-100 scale-100' : 'translate-y-0 opacity-0 scale-95'
                  }`} />
                  <div className={`absolute w-36 h-12 bg-cusBlue/90 rounded-full clay transition-all duration-500 ease-in-out delay-[200ms] shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] ${
                    isMenuOpen ? 'translate-y-[270px] opacity-100 scale-100' : 'translate-y-0 opacity-0 scale-95'
                  }`} />
                </div>

                {/* 실제 링크와 텍스트 */}
                <div className="relative z-20">
                  <Link
                    to={isLoggedIn ? "/main/create-battle-room" : "/main/login"}
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        alert('로그인이 필요한 서비스입니다.');
                        navigate('/main/login');
                      }
                    }}
                    className={`absolute w-36 h-12 flex items-center justify-start px-4 text-white transition-all duration-500 ease-in-out ${
                      isMenuOpen ? 'translate-y-[10px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <i className="ri-message-2-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">배틀 생성</span>
                  </Link>
                  
                  <Link
                    to={isLoggedIn ? "/main/create-vote" : "/main/login"}
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        alert('로그인이 필요한 서비스입니다.');
                        navigate('/main/login');
                      }
                    }}
                    className={`absolute w-36 h-12 flex items-center justify-start px-4 text-white transition-all duration-500 ease-in-out ${
                      isMenuOpen ? 'translate-y-[75px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <i className="ri-chat-poll-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">투표 생성</span>
                  </Link>
                  
                  <Link
                    to="/main/battle-list"
                    className={`absolute w-36 h-12 flex items-center justify-start px-4 text-white transition-all duration-500 ease-in-out ${
                      isMenuOpen ? 'translate-y-[140px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <i className="ri-live-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">배틀</span>
                  </Link>
                  
                  <Link
                    to="/main/vote"
                    className={`absolute w-36 h-12 flex items-center justify-start px-4 text-white transition-all duration-500 ease-in-out ${
                      isMenuOpen ? 'translate-y-[205px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <i className="ri-bar-chart-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">투표</span>
                  </Link>
                  
                  <Link
                    to="/main/store"
                    className={`absolute w-36 h-12 flex items-center justify-start px-4 text-white transition-all duration-500 ease-in-out ${
                      isMenuOpen ? 'translate-y-[270px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <i className="ri-store-2-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">상점</span>
                  </Link>
                </div>
              </div>
            </div>

            <Link to={"/main"}>
              <img src="/images/Logo.png" alt="Logo" className="h-16 w-auto" />
            </Link>

            {/* Mobile Profile Button */}
            <div className="xl:hidden relative ml-6 mt-1" ref={mobileDropdownRef}>
              {isLoggedIn && userNickname ? (
                <>
                  <div className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
                    <Link
                      to="/main/mypage"
                      className="flex items-center gap-6"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={JSON.parse(localStorage.getItem("userInfo"))?.profileImage || "/images/default-profile.png"}
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
                    <div className="absolute right-[50%] translate-x-[50%] mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-[100]">
                      <Link
                        to="/main/mypagereport"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        논쟁 분석 리포트
                      </Link>
                      <Link
                        to="/main/mypagebattle"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        배틀 관리
                      </Link>
                      <Link
                        to="/main/mypagevote"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        투표 관리
                      </Link>
                      <Link
                        to="/main/mypage/edit"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        회원 정보 수정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-sm font-bold text-cusRed hover:bg-gray-100 rounded text-center cursor-pointer"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/main/login"
                    className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/main/signup"
                    className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden xl:block max-w-[550px] flex-1 -ml-24">
            <SearchBar />
          </div>

          {/* Right Section */}
          <div className="hidden xl:flex items-center gap-6">
            {isLoggedIn && userNickname ? (
              <>
                <div className="flex flex-col justify-center h-full gap-2">
                  <Link
                    to={"/main/create-battle-room"}
                    className="btn px-2 xl:px-3 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-28"
                  >
                    <span>배틀 생성</span>
                  </Link>
                  <Link
                    to={"/main/create-vote"}
                    className="btn px-2 xl:px-3 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-28"
                  >
                    <span>투표 생성</span>
                  </Link>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-2 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
                    <Link
                      to="/main/mypage"
                      className="flex items-center gap-6"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={JSON.parse(localStorage.getItem("userInfo"))?.profileImage || "/images/default-profile.png"}
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
                    <div className="absolute right-[50%] translate-x-[50%] mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-[100]">
                      <Link
                        to="/main/mypagereport"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        논쟁 분석 리포트
                      </Link>
                      <Link
                        to="/main/mypagebattle"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        배틀 관리
                      </Link>
                      <Link
                        to="/main/mypagevote"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                      >
                        투표 관리
                      </Link>
                      <Link
                        to="/main/mypage/edit"
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
                  to="/main/login"
                  className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/main/signup"
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
      <div className="xl:hidden px-3 mb-2">
        <SearchBar />
      </div>
    </>
  );
}