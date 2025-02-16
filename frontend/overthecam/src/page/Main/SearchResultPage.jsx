import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchBar from '../../components/Main/SearchBar';
import { publicAxios } from '../../common/axiosinstance';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [searchResults, setSearchResults] = useState({
    battles: [],
    votes: [],
    users: []
  });

  const handleProfileClick = (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/main/login');
      return;
    }

    // 현재 로그인한 사용자의 ID와 비교
    const currentUserId = parseInt(localStorage.getItem('userId'));
    
    // 클릭한 프로필의 userId와 로그인한 사용자의 userId가 같으면 마이페이지로
    if (currentUserId === userId) {
      navigate('/main/mypage', { replace: true });
      return;
    }
    
    // userId가 다르면 해당 유저의 프로필 페이지로
    navigate(`/main/profile/${userId}`);
  };

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }
  }, [searchParams]);

  const handleSearch = async (query) => {
    try {
      // 배틀 검색
      const battleResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/search/battle`, {
        params: { keyword: query }
      });

      // 유저 검색
      const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/search/user`, {
        params: { 
          keyword: query,
          size: 100
        }
      });

      // 투표 검색
      const voteResponse = await publicAxios.get('/vote/list', {
        params: { keyword: query }
      });

      let battles = [];
      let users = [];
      let votes = [];

      if (battleResponse.data.success) {
        battles = battleResponse.data.data.battleInfo.map(battle => ({
          ...battle,
          status: battle.status === "WAITING" ? 0 : 1
        }));
      }

      if (userResponse.data.success) {
        const currentUserId = localStorage.getItem('userId');
        users = userResponse.data.data.userInfo.filter(user => {
          if (currentUserId) {
            return user.userId !== parseInt(currentUserId);
          }
          return true;
        });
      }

      if (voteResponse.data?.content) {
        votes = voteResponse.data.content;
      }

      setSearchResults({
        battles,
        votes,
        users
      });

    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      // 오류 발생 시에도 가능한 결과는 보여주기
      const emptyResults = {
        battles: [],
        votes: [],
        users: []
      };

      try {
        // 각 요청이 실패하더라도 다른 요청의 결과는 표시
        if (error.response?.data?.data?.battleInfo) {
          emptyResults.battles = error.response.data.data.battleInfo;
        }
        if (error.response?.data?.data?.userInfo) {
          emptyResults.users = error.response.data.data.userInfo;
        }
        if (error.response?.data?.content) {
          emptyResults.votes = error.response.data.content;
        }
      } catch (e) {
        console.error("결과 처리 중 오류:", e);
      }

      setSearchResults(emptyResults);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-40" />
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-8">
            <div className="font-extrabold text-lg">
              <SearchBar 
                onSearch={handleSearch} 
                initialValue={searchQuery}
              />
            </div>
          </div>

          {/* 내부 컨테이너 여백 */}
          <div className="container mx-auto p-10">
            {/* Battle Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Battle" />
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
                                  to={`/battle-room/${battle.battleId}`}
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.votes.length > 0 ? (
                  searchResults.votes.map((vote) => (
                    <div key={vote.voteId} className="clay bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div 
                        onClick={() => {
                          const token = localStorage.getItem('token');
                          if (!token) {
                            alert('로그인이 필요합니다.');
                            navigate('/main/login');
                            return;
                          }
                          navigate(`/main/vote-detail/${vote.voteId}`);
                        }}
                        className="cursor-pointer"
                      >
                        <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                          {vote.title}
                        </h2>
                        <p className="text-gray-600 mb-2">{vote.content}</p>
                      </div>

                      <div className="transition-all duration-300">
                        {vote.hasVoted ? (
                          <div className="mb-4">
                            {vote.options && vote.options.length >= 2 && (
                              <>
                                <div className="mb-2 flex justify-between">
                                  <span className="text-red-500 font-medium">{vote.options[0].optionTitle}</span>
                                  <span className="text-blue-500 font-medium">{vote.options[1].optionTitle}</span>
                                </div>
                                <div className="relative h-12 clay bg-gray-200 rounded-lg overflow-hidden">
                                  <div
                                    className="absolute left-0 top-0 h-full clay bg-red-500 flex items-center justify-start pl-2 text-white"
                                    style={{ width: `${vote.options[0].votePercentage}%` }}
                                  >
                                    {vote.options[0].votePercentage.toFixed(1)}%
                                  </div>
                                  <div
                                    className="absolute right-0 top-0 h-full clay bg-blue-500 flex items-center justify-end pr-2 text-white"
                                    style={{ width: `${vote.options[1].votePercentage}%` }}
                                  >
                                    {vote.options[1].votePercentage.toFixed(1)}%
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            {vote.options.map((option) => (
                              <button
                                key={option.optionId}
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  if (!token) {
                                    alert('로그인이 필요합니다.');
                                    navigate('/main/login');
                                    return;
                                  }
                                  navigate(`/main/vote-detail/${vote.voteId}`);
                                }}
                                className={`clay flex-1 p-4 ${
                                  option.optionId === vote.options[0].optionId
                                    ? 'bg-red-100 hover:bg-red-200 text-red-500'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-500'
                                } rounded-lg transition-colors`}
                              >
                                {option.optionTitle}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4">
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
                    <div 
                      onClick={() => handleProfileClick(user.userId)}
                      key={`user-${index}`}
                      className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
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
                    </div>
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