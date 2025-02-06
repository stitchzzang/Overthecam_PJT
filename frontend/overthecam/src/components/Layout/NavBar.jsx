import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add state to track login status

  if (isBattleRoomPage) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="flex flex-grow overflow-hidden mt-16">
        <Sidebar isMenuOpen={isMenuOpen} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} />
        <main className={`transition-all flex-grow overflow-y-auto ${isMenuOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-4">
            {/* Your main content goes here */}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ isMenuOpen, isDropdownOpen, setIsDropdownOpen }) {
  return (
    <div className={`fixed top-35 left-0 h-[calc(100%-4rem)] w-64 bg-white transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
      <div className="p-4">
        {/* Action buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <Link to={"/create-battle-room"} className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center">
            방 만들기
          </Link>
          <Link to={"/create-vote"} className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center">
            투표 만들기
          </Link>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col gap-4">
          <Link to={"/battle-list"} className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded">
            배틀 방 보기
          </Link>
          <div className="relative">
            <button
              className="flex items-center text-gray-700 font-medium p-2 hover:bg-gray-100 rounded w-full"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              투표
              <span className="ml-1">🔽</span>
            </button>
            {isDropdownOpen && (
              <div className="ml-4">
                <Link to={"/vote-inprogress"} className="block p-2 hover:bg-gray-100 rounded">
                  진행중인 투표
                </Link>
                <Link to={"/vote-closed"} className="block p-2 hover:bg-gray-100 rounded">
                  종료된 투표
                </Link>
              </div>
            )}
          </div>
          <Link to={"/store"} className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded">
            상점
          </Link>
        </div>
      </div>
    </div>
  );
}

function Header({ isMenuOpen, setIsMenuOpen, isLoggedIn, setIsLoggedIn }) {
  return (
    <header className="p-3 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
          <Link to={"/"}>
            <img src="public/images/Logo.png" alt="Logo" className="h-12" style={{ width: 'auto', maxWidth: '200px' }} />
          </Link>
        </div>
        <div className="flex-grow max-w-md mx-auto">
          <div className="flex items-center bg-gray-100 rounded-[30px] h-[50px] px-4">
            <input
              type="text"
              className="bg-transparent flex-grow focus:outline-none"
              placeholder="검색"
            />
            <button className="bg-[#E8F1FF] p-1.5 rounded-full text-blue-600">
              🔍
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-">
          <div className="flex flex-col gap-2">
            <Link to="/create-battle-room" className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center">
              방 만들기
            </Link>
            <Link to="/create-vote" className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center">
              투표 만들기
            </Link>
          </div>
          {isLoggedIn ? (
            <>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <span className="text-gray-700 whitespace-nowrap text-sm">
                우끼끼정해기 님,
                <br />
                안녕하세요!
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded">
                로그인
              </Link>
              <Link to="/signup" className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}