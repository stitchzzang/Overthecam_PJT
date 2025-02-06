import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");

  if (isBattleRoomPage) {
    return null;
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="w-full px-4 py-3 bg-">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo section */}
        <div className="flex-shrink-0">
          <Link to={"/"}><img src="public/images/Logo.png" alt="Logo" className="h-12"/></Link>
        </div>

        {/* Search section */}
        <div className="flex-grow max-w-3xl">
          <div className="flex items-center bg-gray-100 rounded-[30px] h-[50px] px-6 py-2">
            <div className="flex items-center gap-6 flex-grow">
              <Link to={"/battle-list"} className="text-gray-700 font-medium">배틀 방 보기</Link>
              <div className="h-5 w-[1px] bg-gray-300"></div>
              <div className="relative">
                <button
                  className="flex items-center text-gray-700 font-medium"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  투표
                  <span className="ml-1">🔽</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full mt-1 w-32 bg-white shadow-lg rounded-md py-1 z-50">
                    <Link to={"/"} className="block px-4 py-2 hover:bg-gray-100">
                      진행중인 투표
                    </Link>
                    <Link to={"/"} className="block px-4 py-2 hover:bg-gray-100">
                      종료된 투표
                    </Link>
                  </div>
                )}
              </div>
              <div className="h-5 w-[1px] bg-gray-300"></div>
              <Link to={"/store"} className="text-gray-700 font-medium">상점</Link>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <input
                type="text"
                className="bg-white rounded-full px-4 py-1 text-sm w-24 focus:outline-none"
                placeholder="검색"
              />
              <button className="bg-[#E8F1FF] p-1.5 rounded-full text-blue-600">
                🔍
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1">
          <Link to={"/create-battle-room"} className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium whitespace-nowrap">
            방 만들기
          </Link>
          <Link to={"/"} className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium whitespace-nowrap">
            투표 만들기
          </Link>
        </div>

        {/* Login and Signup section */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 text-sm font-medium whitespace-nowrap">
            로그인
          </Link>
          <Link to="/signup" className="px-4 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium whitespace-nowrap">
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}