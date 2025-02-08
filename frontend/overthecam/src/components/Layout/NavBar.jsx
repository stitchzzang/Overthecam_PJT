import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function NavBar() {
  const location = useLocation();
  const isBattleRoomPage = location.pathname.startsWith("/battle-room");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isBattleRoomPage) {
    return null;
  }

  return (
    <>
      <header className="h-[60px] mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-4">
            <button
              className="text-3xl bg-transparent hover:bg-transparent border-none focus:outline-none text-cusBlue"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
            <Link to={"/"}>
              <img
                src="/images/Logo.png"
                alt="Logo"
                className="h-12"
                style={{ width: "auto", maxWidth: "200px" }}
              />
            </Link>
          </div>
            <SearchBar/>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex gap-2">
                  <Link
                    to="/create-battle-room"
                    className="btn px-6 py-2 bg-btnPink text-btnPink-hover rounded-full hover:bg-btnPink-hover hover:text-btnPink text-center"
                  >
                    방 만들기
                  </Link>
                  <Link
                    to="/create-vote"
                    className="btn px-6 py-2 bg-btnPink text-btnPink-hover rounded-full hover:bg-btnPink-hover hover:text-btnPink text-center"
                  >
                    투표 만들기
                  </Link>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <span className="text-gray-700 whitespace-nowrap text-sm">
                  우끼끼정해기 님,
                  <br />
                  안녕하세요!
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn px-6 py-2 bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="btn px-6 py-2 bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center"
                >
                  회원가입
                </Link>
              </>
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
              className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center"
            >
              방 만들기
            </Link>
            <Link
              to={"/create-vote"}
              className="px-6 py-2 bg-[#FFE7E7] text-[#FF5C5C] rounded-full hover:bg-pink-200 text-sm font-medium text-center"
            >
              투표 만들기
            </Link>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-4">
            <Link
              to={"/battle-list"}
              className="text-gray-700 font-medium p-2 hover:bg-gray-100 rounded"
            >
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