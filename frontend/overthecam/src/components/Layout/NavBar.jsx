import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import useUserStore from "../../store/User/UserStore";
import 'remixicon/fonts/remixicon.css';
import { motion } from "framer-motion";
import { authAxios } from "../../common/axiosinstance";
// Logo 컴포넌트 수정
const Logo = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    // 현재 경로가 /main인 경우 새로고침, 아니면 메인으로 이동
    if (location.pathname === '/main') {
      window.location.reload();
    } else {
      navigate('/main');
    }
  };

  return (
    <motion.img 
      src="/assets/Logo.png" 
      alt="Logo" 
      className="h-16 w-auto cursor-pointer" 
      animate={isAnimating ? {
        scale: [1, 1.2, 0.9, 1.1, 1],
        rotate: [0, 10, -10, 5, 0],
      } : {}}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      onClick={handleLogoClick}
      whileHover={{ scale: 1.05 }}
    />
  );
};

// 닉네임 말줄임표 처리 함수 추가
const truncateNickname = (nickname) => {
  if (nickname.length > 5) {
    return nickname.slice(0, 5) + '...';
  }
  return nickname;
};

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isBattleRoomPage = location.pathname.startsWith("/main/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef(null);  // 사이드바용 ref 추가
  const mobileDropdownRef = useRef(null);

  // Zustand store 사용
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const userNickname = userStore.userNickname ? userStore.userNickname : null;
  const [profileImage, setProfileImage] = useState(
    JSON.parse(localStorage.getItem("userInfo"))?.profileImage || "/assets/default-profile.png"
  );

  // localStorage 변경 감지를 위한 useEffect 수정
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const userInfoStr = localStorage.getItem("userInfo");
      
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
    
    // localStorage의 userInfo가 변경될 때마다 프로필 이미지 업데이트
    const handleStorageChange = () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      setProfileImage(userInfo?.profileImage || "/assets/default-profile.png");
    };

    // localStorage 변경 이벤트 리스너 추가
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 내부의 변경도 감지하기 위한 MutationObserver 설정
    const observer = new MutationObserver(handleStorageChange);
    observer.observe(document.body, { 
      subtree: true, 
      childList: true 
    });

    // cleanup
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // 외부 클릭 감지를 위한 useEffect 수정
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="menu"]')) {
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

  // NavBar.jsx에서 이벤트 리스너 추가
  useEffect(() => {
    // 프로필 이미지 업데이트 이벤트 핸들러
    const handleProfileUpdate = (event) => {
      console.log("프로필 이미지 업데이트 이벤트 수신:", event.detail);  // 디버깅용
      const newImage = event.detail.profileImage;
      setProfileImage(newImage);
    };

    // 이벤트 리스너 등록
    window.addEventListener('profileImageUpdated', handleProfileUpdate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileUpdate);
    };
  }, []);

  // localStorage 변경 감지
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.profileImage) {
      setProfileImage(userInfo.profileImage);
    }
  }, [localStorage.getItem("userInfo")]);

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      await authAxios.post('/auth/logout');
      
      // localStorage 데이터 삭제
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userId");
      
      // Zustand store 상태 초기화
      useUserStore.setState({ 
        isLoggedIn: false, 
        userNickname: null,
        userId: null 
      });
      
      // 홈으로 이동
      navigate("/main");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러 발생시에도 로컬 데이터는 삭제
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userId");
      
      useUserStore.setState({ 
        isLoggedIn: false, 
        userNickname: null,
        userId: null 
      });
      
      navigate("/main");
    }
  };

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

      <header className="h-[80px] mb-4 mt-5">
        <div className="max-w-7xl mx-auto h-full px-1 relative flex items-center">
          {/* Left Section - Logo & Menu Button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* 오버레이 추가 */}
              <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} 
                   onClick={() => setIsMenuOpen(false)} />

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
                <div className="absolute left-0 top-0 gooey-filter">
                  <div className={`gooey-menu-item gooey-menu-item-1 ${isMenuOpen ? 'active' : ''}`} />
                  <div className={`gooey-menu-item gooey-menu-item-2 ${isMenuOpen ? 'active' : ''}`} />
                  <div className={`gooey-menu-item gooey-menu-item-3 ${isMenuOpen ? 'active' : ''}`} />
                  <div className={`gooey-menu-item gooey-menu-item-4 ${isMenuOpen ? 'active' : ''}`} />
                  <div className={`gooey-menu-item gooey-menu-item-5 ${isMenuOpen ? 'active' : ''}`} />
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
                    className={`menu-link menu-link-1 ${isMenuOpen ? 'active' : ''}`}
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
                    className={`menu-link menu-link-2 ${isMenuOpen ? 'active' : ''}`}
                  >
                    <i className="ri-chat-poll-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">투표 생성</span>
                  </Link>
                  
                  <Link
                    to="/main/battle-list"
                    className={`menu-link menu-link-3 ${isMenuOpen ? 'active' : ''}`}
                  >
                    <i className="ri-live-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">배틀</span>
                  </Link>
                  
                  <Link
                    to="/main/vote"
                    className={`menu-link menu-link-4 ${isMenuOpen ? 'active' : ''}`}
                  >
                    <i className="ri-bar-chart-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">투표</span>
                  </Link>
                  
                  <Link
                    to="/main/store"
                    className={`menu-link menu-link-5 ${isMenuOpen ? 'active' : ''}`}
                  >
                    <i className="ri-store-2-line text-2xl"></i>
                    <span className="text-[15px] font-bold ml-3">상점</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Logo */}
            <Logo />

            {/* Mobile Profile Button - 다시 추가 */}
            <div className="xl:hidden relative ml-6 mt-1" ref={mobileDropdownRef}>
              {isLoggedIn && userNickname ? (
                <div className="flex items-center gap-4">
                  <Link to="/main/mypage" className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-3 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
                    <div className="w-8 h-8 rounded-full overflow-hidden -ml-1">
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/assets/default-profile.png";
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      <span className="font-bold">{truncateNickname(userNickname)}</span> 님,
                      <br />
                      안녕하세요!
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="btn px-6 py-4 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center min-w-[120px]">
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/main/login" className="btn px-6 py-4 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center">
                    로그인
                  </Link>
                  <Link to="/main/signup" className="btn px-6 py-4 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden xl:block w-[550px] ml-4">
            <SearchBar />
          </div>

          {/* Right Section - 남은 공간을 차지하도록 수정 */}
          <div className="hidden xl:flex items-center gap-3 flex-1 justify-end">
            {isLoggedIn && userNickname ? (
              <>
                <div className="flex flex-col justify-center h-full gap-2">
                  <Link
                    to={"/main/create-battle-room"}
                    className="btn px-4 xl:px-3 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-28 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M14 10.25L17 8V14L14 11.75V14H7V8H14V10.25ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z" />
                    </svg>
                    <span> 배틀 생성</span>
                  </Link>
                  <Link
                    to={"/main/create-vote"}
                    className="btn px-4 xl:px-3 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center whitespace-nowrap w-28 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 2H13V21H11V2Z" />
                    </svg>
                    <span> 투표 생성</span>
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/main/mypage"
                    className="flex items-center gap-3 bg-cusGray text-gray-700 rounded-full px-6 py-3 hover:bg-gray-200 text-sm font-medium text-center shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out transform scale-100 hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden -ml-1">
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/assets/default-profile.png";
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      <span className="font-bold">{truncateNickname(userNickname)}</span> 님,
                      <br />
                      안녕하세요!
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="btn px-8 py-4 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center min-w-[120px]"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/main/login"
                  className="btn px-4 py-2 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/main/signup"
                  className="btn px-4 py-2 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="xl:hidden w-full px-4 max-w-[550px] mx-auto mb-2">
        <SearchBar />
      </div>
    </>
  );
}