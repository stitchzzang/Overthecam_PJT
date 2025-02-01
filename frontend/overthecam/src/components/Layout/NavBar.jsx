import { useState } from "react";

export default function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="w-full px-4 py-3 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo section */}
        <div className="flex-shrink-0">
          <img src="public/images/Logo.png" alt="Logo" className="h-12" />
        </div>

        {/* Search section */}
        <div className="flex-grow max-w-3xl">
          <div className="flex items-center bg-gray-100 rounded-[30px] h-[50px] px-6 py-2">
            <div className="flex items-center gap-6 flex-grow">
              <span className="text-gray-700 font-medium">배틀 방 보기</span>
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
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      진행중인 투표
                    </a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      종료된 투표
                    </a>
                  </div>
                )}
              </div>
              <div className="h-5 w-[1px] bg-gray-300"></div>
              <span className="text-gray-700 font-medium">상점</span>
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
          <button className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium whitespace-nowrap">
            방 만들기
          </button>
          <button className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium whitespace-nowrap">
            투표 만들기
          </button>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-full">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <span className="text-gray-700 whitespace-nowrap text-sm">
            우끼끼정해기 님,
            <br />
            안녕하세요!
          </span>
        </div>
      </div>
    </nav>
  );
}
