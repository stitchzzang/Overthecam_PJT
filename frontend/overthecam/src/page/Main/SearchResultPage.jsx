import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import SearchBar from '../../components/Main/SearchBar';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-32">{children}</div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start justify-start">
    {title}
  </h2>
);

const StatusBadge = ({ status }) => {
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold";
  return status === 0 ? (
    <span className={`${baseClasses} bg-cusRed-light text-cusBlack`}>
      입장하기
    </span>
  ) : (
    <div className={`${baseClasses} bg-cusLightBlue text-white pointer-events-none`}>
      진행 중
    </div>
  );
};

const ParticipantsBadge = ({ current, max }) => {
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold pointer-events-none";
  return (
    <span className={`${baseClasses} bg-cusGray-light text-cusBlack`}>
      {current} / {max}
    </span>
  );
};

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [searchResults, setSearchResults] = useState({
    battles: [],
    votes: [],
    users: []
  });

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }
  }, [searchParams]);

  const handleSearch = async (query) => {
    try {
      // 기본 헤더
      const headers = {
        'Content-Type': 'application/json'
      };

      // 배틀 검색
      const battleResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/search/battle`, {
        params: { keyword: query },
        headers
      });

      // 유저 검색 - 페이지 크기를 크게 설정
      const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/search/user`, {
        params: { 
          keyword: query,
          size: 100
        },
        headers
      });
      
      console.log('User Search Response:', userResponse.data);

      let battles = [];
      let users = [];

      if (battleResponse.data.success) {
        battles = battleResponse.data.data.battleInfo.map(battle => ({
          ...battle,
          status: battle.status === "WAITING" ? 0 : 1
        }));
      }

      if (userResponse.data.success) {
        users = userResponse.data.data.userInfo || [];
        console.log('Processed users:', users);
      }

      setSearchResults({
        battles,
        votes: [],
        users
      });
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      setSearchResults({
        battles: [],
        votes: [],
        users: []
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        <div className="container mx-auto px-4">
          {/* 검색바 위치 조정 - 살짝 더 위로 */}
          <div className="relative -mt-12">
            <div className="font-extrabold text-lg">
              <SearchBar 
                onSearch={handleSearch} 
                initialValue={searchQuery}
              />
            </div>
          </div>

          {/* 내부 컨테이너 여백 */}
          <div className="container mx-auto p-14">
            {/* Battle Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Battle" />
                <Link
                  to="/main/battle-list"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + More
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.battles.length > 0 ? (
                  searchResults.battles.map((battle) => (
                    <div 
                      key={`battle-${battle.battleId}`}
                      className="block"
                    >
                      <div className="clay p-4 bg-white h-32 hover:scale-105 transition-transform">
                        <div className="flex h-full gap-4">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={battle.thumbnailUrl} 
                              alt={battle.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex flex-col justify-center flex-grow h-full">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-3">
                              {battle.title}
                            </h3>
                            <div className="flex justify-center items-center gap-2">
                              <ParticipantsBadge current={battle.totalUsers} max={6} />
                              {battle.status === 0 ? (
                                <Link 
                                  to={`/main/battle-room/${battle.battleId}`}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <StatusBadge status={battle.status} />
                                </Link>
                              ) : (
                                <StatusBadge status={battle.status} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-gray-500">Battle 검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            </section>

            {/* Vote Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Vote" />
                <Link
                  to="/main/vote"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + More
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.votes.length > 0 ? (
                  searchResults.votes.map((vote) => (
                    <div key={`vote-${vote.id}`} className="p-4 bg-white rounded-lg shadow h-32">
                      <Link 
                        to={`/main/vote-detail/${vote.voteId}`}
                        className="hover:scale-105 transition-transform"
                      >
                        {vote.title}
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-gray-500">Vote 검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            </section>

            {/* User Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="User" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.users.length > 0 ? (
                  searchResults.users.map((user, index) => (
                    <Link 
                      to={`/main/profile/${user.userId}`}
                      key={`user-${index}`}
                      className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.nickname} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-cusGray-light">
                              <span className="text-white text-xl">
                                {user.nickname.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {user.nickname}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-gray-500">User 검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;