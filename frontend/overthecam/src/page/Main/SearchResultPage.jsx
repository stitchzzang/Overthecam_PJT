import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchBar from '../../components/Main/SearchBar';
import { publicAxios } from '../../common/axiosinstance';
import { authAxios } from '../../common/axiosinstance';
import { joinRoom } from "../../service/BattleRoom/api";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";

const createConfetti = (isFirstOption) => {
  const emojis = isFirstOption 
    ? ['🍎', '❤️', '🍒', '🎀','🍬','👺']
    : ['💙', '🐠', '🌍', '💎','🐬','❄️'];

  for (let i = 0; i < 15; i++) {
    const confetti = document.createElement('div');
    const animationType = `type-${Math.floor(Math.random() * 4) + 1}`;
    confetti.className = `confetti ${animationType}`;
    confetti.style.left = `${Math.random() * window.innerWidth}px`;
    confetti.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2500);
  }
};

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start justify-start">
    {title}
  </h2>
);

const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [searchResults, setSearchResults] = useState({
    battles: [],
    votes: [],
    users: []
  });
  const [votingStates, setVotingStates] = useState({});
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state) => state.userNickname);

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
      // 배틀 검색 - public
      const battleResponse = await publicAxios.get('/search/battle', {
        params: { keyword: query }
      });

      // 유저 검색 - public
      const userResponse = await publicAxios.get('/search/user', {
        params: { 
          keyword: query,
          size: 100
        }
      });

      // 투표 검색 - 로그인한 사용자의 경우 authAxios 사용
      const token = localStorage.getItem('token');
      const voteResponse = token 
        ? await authAxios.get('/vote/list', { params: { keyword: query } })
        : await publicAxios.get('/vote/list', { params: { keyword: query } });

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
        // 각 투표의 상세 정보를 가져와서 hasVoted 상태 확인
        const votesWithStatus = await Promise.all(
          voteResponse.data.content.map(async (vote) => {
            if (token) {
              try {
                const detailResponse = await authAxios.get(`/vote/${vote.voteId}`);
                return {
                  ...vote,
                  ...detailResponse.data,
                  hasVoted: detailResponse.data.hasVoted
                };
              } catch (error) {
                console.error(`투표 ${vote.voteId} 상세 정보 가져오기 실패:`, error);
                return vote;
              }
            }
            return vote;
          })
        );
        votes = votesWithStatus;
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

  const handleVote = async (vote, optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }

      // 리플 이펙트 생성
      const button = document.querySelector(`#vote-button-${optionId}`);
      if (button) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        button.appendChild(ripple);
        ripple.classList.add('active');

        // 컨페티 생성
        const isFirstOption = optionId === vote.options[0].optionId;
        createConfetti(isFirstOption);

        // 서버에 투표 요청
        await authAxios.post(`/vote/${vote.voteId}/vote/${optionId}`);

        // 최신 데이터 가져오기
        const response = await authAxios.get(`/vote/${vote.voteId}`);
        if (response.data) {
          const updatedVotes = searchResults.votes.map(v => 
            v.voteId === vote.voteId ? { ...response.data, hasVoted: true } : v
          );
          setSearchResults(prev => ({
            ...prev,
            votes: updatedVotes
          }));
        }

        // 리플 제거
        setTimeout(() => ripple.remove(), 600);
      }
    } catch (error) {
      console.error('투표 처리 중 오류 발생:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
      }
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeGroup = (age) => {
    if (age < 20) return '10';
    if (age < 30) return '20';
    if (age < 40) return '30';
    if (age < 50) return '40';
    return '50';
  };

  const gotoBattleRoom = async (battleId) => {
    console.log(battleId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/main/login");
        return;
      }

      const response = await joinRoom(battleId, userNickname);
      await new Promise((resolve) => {
        const newBattleInfo = {
          battleId: response.data.battleId,
          participantName: userNickname,
          roomName: response.data.roomName,
          userToken: response.data.token,
          isMaster: false,
        };

        setBattleInfo(newBattleInfo);
        requestAnimationFrame(resolve);
      });

      // 배틀룸으로 이동
      navigate(`/main/battle-room/${battleId}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
      alert("배틀룸 입장에 실패했습니다.");
    }
  };

  // StatusBadge 컴포넌트 수정
  const StatusBadge = ({ status, battleId }) => {
    const baseClasses = "btn px-3 py-2 text-sm font-bold rounded-lg whitespace-nowrap";
    return status === 0 ? (
      <button
        className={`${baseClasses} bg-gradient-to-r from-cusPink to-cusLightBlue hover:from-cusLightBlue hover:to-cusPink text-black font-bold cursor-pointer`}
        onClick={() => gotoBattleRoom(battleId)}
      >
        입장
      </button>
    ) : (
      <button className={`${baseClasses} bg-cusGray text-white pointer-events-none`}>
        진행
      </button>
    );
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
                      <div className="clay p-4 bg-white h-[140px] hover:shadow-xl transition-shadow">
                        <div className="flex h-full gap-4">
                          <div className="w-[100px] h-[100px] flex-shrink-0 flex items-center justify-center">
                            <img 
                              src={battle.thumbnailUrl} 
                              alt={battle.title}
                              className="w-[100px] h-[100px] object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 flex flex-col px-4">
                            <div className="flex-1 flex items-center mb-4">
                              <h3 className="text-lg font-semibold line-clamp-1 text-black">
                                {battle.title}
                              </h3>
                            </div>
                            <div className="flex justify-between items-center gap-4 mb-2">
                              <span className="text-cusBlue font-bold">
                                {battle.totalUsers}/6
                              </span>
                              <StatusBadge 
                                status={battle.status} 
                                battleId={battle.battleId}
                              />
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
                        {(vote.hasVoted || votingStates[vote.voteId]) ? (
                          <div className="mb-4">
                            <div className="flex justify-between mb-2">
                              <div className="text-cusRed font-bold">
                                A. {vote.options[0].optionTitle}
                              </div>
                              <div className="text-cusBlue font-bold">
                                B. {vote.options[1].optionTitle}
                              </div>
                            </div>
                            <div className="relative h-12 rounded-full overflow-hidden">
                              {vote.options[0].votePercentage > 0 && (
                                <div
                                  className="absolute left-0 top-0 h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold"
                                  style={{ width: `${vote.options[0].votePercentage >= 100 ? 100 : vote.options[0].votePercentage}%` }}
                                >
                                  {vote.options[0].votePercentage < 25 ? (
                                    <div className="text-base flex flex-col">
                                      <div>{Math.round(vote.options[0].votePercentage)}%</div>
                                    </div>
                                  ) : (
                                    <span className="text-lg">{Math.round(vote.options[0].votePercentage)}%</span>
                                  )}
                                </div>
                              )}
                              {vote.options[1].votePercentage > 0 && (
                                <div
                                  className="absolute right-0 top-0 h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold"
                                  style={{ width: `${vote.options[1].votePercentage >= 100 ? 100 : vote.options[1].votePercentage}%` }}
                                >
                                  {vote.options[1].votePercentage < 25 ? (
                                    <div className="text-base flex flex-col items-end">
                                      <div>{Math.round(vote.options[1].votePercentage)}%</div>
                                    </div>
                                  ) : (
                                    <span className="text-lg">{Math.round(vote.options[1].votePercentage)}%</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            {vote.options.map((option) => (
                              <button
                                id={`vote-button-${option.optionId}`}
                                key={option.optionId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(vote, option.optionId);
                                }}
                                className={`vote-button clay flex-1 p-4 ${
                                  option.optionId === vote.options[0].optionId
                                    ? 'vote-button-red bg-red-100 hover:bg-red-200 text-cusRed'
                                    : 'vote-button-blue bg-blue-100 hover:bg-blue-200 text-cusBlue'
                                } rounded-lg transition-colors text-lg font-bold relative overflow-hidden`}
                              >
                                {option.optionTitle}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* 투표 여부와 관계없이 항상 표시되는 정보 */}
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                              </svg>
                              {vote.creatorNickname}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                              </svg>
                              댓글 {vote.commentCount}개
                            </span>
                          </div>
                          <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {vote.totalVoteCount.toLocaleString()}명 참여중
                            </span>
                          </div>
                        </div>
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