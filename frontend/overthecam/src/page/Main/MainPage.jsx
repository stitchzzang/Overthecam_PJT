import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion } from "framer-motion"; // 메인 Framer motion 추가
import { publicAxios, authAxios } from '../../common/axiosinstance';
import { joinRoom } from "../../service/BattleRoom/api";
import { useBattleStore } from "../../store/Battle/BattleStore";
import useUserStore from "../../store/User/UserStore";
// import Joyride from 'react-joyride'; // 코치마크를 위한 import - 추후 구현 예정

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-32">{children}</div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start justify-start">
    {title}
  </h2>
);

const StatusBadge = ({ status, onClick }) => {
  const baseClasses = "btn text-sm font-bold rounded-lg whitespace-nowrap";
  return status === 0 ? (
    <span 
      onClick={onClick}
      className={`${baseClasses} py-2 px-2 xl:px-6 bg-gradient-to-r from-cusPink to-cusLightBlue hover:from-cusLightBlue hover:to-cusPink text-black cursor-pointer`}
    >
      <span className="hidden xl:inline">입장하기</span>
      <span className="xl:hidden">입장</span>
    </span>
  ) : (
    <div className={`${baseClasses} py-2 px-2 xl:px-6 bg-cusGray-dark text-white pointer-events-none`}>
      <span className="hidden xl:inline">진행 중</span>
      <span className="xl:hidden">진행</span>
    </div>
  );
};

// 새로운 PopularVote 컴포넌트 추가
const PopularVote = ({ onVoteUpdate }) => {
  const navigate = useNavigate();
  const [popularVotes, setPopularVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchPopularVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await publicAxios.get('/vote/list', {
        params: {
          page: 0,
          size: 100,
          status: 'active'
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // 데이터 접근 경로 수정
      const voteList = response.data?.content;
      
      if (voteList && voteList.length > 0) {
        // totalVoteCount로 정렬 후 상위 5개 선택
        const sortedVotes = voteList
          .sort((a, b) => b.totalVoteCount - a.totalVoteCount)
          .slice(0, 5);
        
        setPopularVotes(sortedVotes);
      } else {
        console.error("투표 목록이 비어있습니다");
        setPopularVotes([]);
      }
    } catch (error) {
      console.error('인기 투표 조회 중 오류 발생:', error);
      setPopularVotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularVotes();
    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchPopularVotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % popularVotes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + popularVotes.length) % popularVotes.length);
  };

  const getSlideClass = (index) => {
    if (popularVotes.length <= 1) return 'active';
    
    const diff = (index - currentIndex + popularVotes.length) % popularVotes.length;
    if (diff === 0) return 'active';
    if (diff === 1 || diff === -4) return 'next';
    if (diff === popularVotes.length - 1 || diff === -1) return 'prev';
    return '';
  };

  // 순위 뱃지 매핑 함수 추가
  const getRankBadge = (index) => {
    switch(index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏅";
    }
  };

  if (loading || popularVotes.length === 0) return null;

  return (
    <div className="popular-vote-window">
      <div className="flex items-center px-4 py-2 bg-cusGray rounded-t-lg">
        <div className="flex-1 text-left">
          <h3 className="text-gray-800 font-bold">🔥 인기 투표 TOP 5</h3>
        </div>
      </div>
      
      <div className="popular-vote-carousel">
        <ul className="popular-vote-list">
          {popularVotes.map((vote, index) => {
            const slideClass = getSlideClass(index);
            const isActive = slideClass === 'active';
            
            return (
              <li 
                key={vote.voteId} 
                className={`popular-vote-item ${slideClass}`}
                onClick={() => {
                  if (slideClass === 'prev') prevSlide();
                  if (slideClass === 'next') nextSlide();
                }}
              >
                <div className="p-4">
                  <div className="clay bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-left">
                        <Link 
                          to={`/main/vote-detail/${vote.voteId}`}
                          className="block"
                          onClick={(e) => {
                            // 중앙 카드가 아닐 경우 상세 페이지 이동 방지
                            if (!isActive) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (!localStorage.getItem('token')) {
                              e.preventDefault();
                              alert('로그인이 필요합니다.');
                              navigate('/main/login');
                            }
                          }}
                        >
                          <h2 className={`text-xl font-bold mb-3 line-clamp-1 ${isActive ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'}`}>
                            <span className="mr-2 text-2xl">{getRankBadge(index)}</span>
                            {vote.title}
                          </h2>
                        </Link>
                        
                        <p className="text-gray-600 mb-2 line-clamp-2 text-sm">
                          {vote.content}
                        </p>
                      </div>

                      <div className="bg-gray-100 px-3 py-1 rounded-full shrink-0 ml-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {vote.totalVoteCount.toLocaleString()}명 참여중
                        </span>
                      </div>
                    </div>

                    {vote.hasVoted ? (
                      <div>
                        <div className="mb-2 flex justify-between">
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
                            key={option.optionId}
                            onClick={(e) => {
                              e.stopPropagation();
                              // 중앙 카드가 아닐 경우 투표 방지
                              if (!isActive) return;
                              onVoteUpdate(vote.voteId, option.optionId);
                            }}
                            className={`clay flex-1 p-4 ${
                              option.optionId === vote.options[0].optionId
                                ? 'bg-red-100 hover:bg-red-200 text-cusRed'
                                : 'bg-blue-100 hover:bg-blue-200 text-cusBlue'
                            } rounded-lg transition-colors text-lg font-bold ${
                              !isActive ? 'opacity-50 cursor-default pointer-events-none' : 'cursor-pointer'
                            }`}
                          >
                            {option.optionTitle}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const MainPage = () => {
  const [battleList, setBattleList] = useState([]);
  const [voteList, setVoteList] = useState([]);
  const [popularVoteKey, setPopularVoteKey] = useState(0); // PopularVote 컴포넌트 리렌더링을 위한 key
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo');
  const userId = userInfo ? JSON.parse(userInfo).userId : null;
  const setBattleInfo = useBattleStore((state) => state.setBattleInfo);
  const userNickname = useUserStore((state) => state.userNickname);

  // 코치마크 단계 정의 - 추후 구현 예정
  /*
  const steps = [
    {
      target: '.battle-section',
      content: '여기서 진행중인 배틀을 확인할 수 있어요!',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.status-badge',
      content: '배틀에 참여하려면 이 버튼을 클릭하세요.',
      placement: 'left',
    },
    {
      target: '.vote-section',
      content: '투표에 참여하고 우승자를 선택해보세요!',
      placement: 'top',
    }
  ];
  */

  useEffect(() => {
    // 코치마크 관련 코드 - 추후 구현 예정
    /*
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    if (isFirstVisit) {
      setRunTour(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    */
    fetchBattles();
    fetchVotes();
  }, []);

  const fetchBattles = async () => {
    try {
      // baseURL 설정 확인
      const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';
      
      const response = await axios.get(`${baseURL}/battle/room/all`, {
        // timeout 설정 추가
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        const battles = response.data.data.battleInfo.map(battle => ({
          ...battle,
          status: typeof battle.status === 'string' 
            ? battle.status === "WAITING" ? 0 : 1
            : battle.status
        }));
        setBattleList(battles.slice(0, 6));
      } else {
        console.error("배틀 목록 조회 실패:", response.data.error);
        setBattleList([]);
      }
    } catch (error) {
      console.error("배틀 목록 조회 중 오류 발생:", error);
      // 에러 발생시 빈 배열로 설정하여 UI가 깨지지 않도록 함
      setBattleList([]);
    }
  };

  // 투표 목록 가져오기
  const fetchVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await publicAxios.get('/vote/list', { 
        params: {
          page: 0,
          size: 6,
          status: 'active'
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data?.content) {
        setVoteList(response.data.content);
      }
    } catch (error) {
      console.error("투표 목록 조회 중 오류 발생:", error);
      setVoteList([]);
    }
  };

  // 투표 처리 함수를 상위 컴포넌트로 이동
  const handleVoteUpdate = async (voteId, optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }

      // UI 즉시 업데이트 (일반 투표 목록)
      setVoteList(prevList => 
        prevList.map(v => {
          if (v.voteId === voteId) {
            const updatedOptions = v.options.map(option => ({
              ...option,
              voteCount: option.optionId === optionId ? option.voteCount + 1 : option.voteCount
            }));
            
            const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.voteCount, 0);
            
            const optionsWithPercentage = updatedOptions.map(option => ({
              ...option,
              votePercentage: (option.voteCount / totalVotes) * 100
            }));

            return {
              ...v,
              hasVoted: true,
              options: optionsWithPercentage
            };
          }
          return v;
        })
      );

      // 서버에 투표 요청
      await authAxios.post(`/vote/${voteId}/vote/${optionId}`);
      
      // PopularVote 컴포넌트 리렌더링
      setPopularVoteKey(prev => prev + 1);
      
      // 투표 목록 새로고침
      await fetchVotes();

    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }
      if (err.response?.data?.error?.code === 'DUPLICATE_VOTE') {
        // 이미 투표한 경우 UI 업데이트만 수행
        await fetchVotes();
        setPopularVoteKey(prev => prev + 1);
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleVoteDetailClick = (voteId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/main/login');
      return;
    }
    navigate(`/main/vote-detail/${voteId}`);
  };

  const renderVoteResult = (vote) => (
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
  );

  // 배틀룸 입장 처리 함수 수정
  const handleBattleEnter = async (battleId, status) => {
    if (status !== 0) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/main/login');
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

      navigate(`/main/battle-room/${battleId}`);
    } catch (error) {
      console.error("Battle room navigation error:", error);
      navigate('/main/battle-list');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 코치마크 컴포넌트 - 추후 구현 예정
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        hideCloseButton={true}
        spotlightClicks={true}
        styles={{
          options: {
            primaryColor: '#4A90E2',
            zIndex: 10000,
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
          tooltipContainer: {
            textAlign: 'center',
          },
          buttonNext: {
            backgroundColor: '#4A90E2',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
        locale={{
          back: '이전',
          close: '닫기',
          last: '완료',
          next: '다음',
          skip: '건너뛰기'
        }}
        callback={(data) => {
          const { status, type } = data;
          if (['finished', 'skipped'].includes(status)) {
            setRunTour(false);
          }
        }}
      />
      */}

      <div className="relative">
        {/* 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56 relative">
          {/* 투표 참여하기 버튼 추가 */}
          <Link 
            to="/main/vote"
            className="absolute top-8 right-8 border-2 border-cusBlack-light text-cusBlack-light px-6 py-2.5 rounded-3xl 
              bg-transparent hover:bg-cusBlack-light hover:text-white transition-all duration-300 "
          >
            투표 참여하러 가기
          </Link>
        </div>
        
        {/* PopularVote 컴포넌트 */}
        <PopularVote 
          key={popularVoteKey} 
          onVoteUpdate={handleVoteUpdate}
        />
        
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-14 pt-44 pb-12">
            {/* Battle Section */}
            <motion.section 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{
                ease: 'easeInOut',
                duration: 2,
                x: { duration: 1 },
              }}
              className="flex flex-col mb-16 battle-section"
            >
              <div className="flex justify-between items-center">
                <SectionTitle title="지금 바로 논쟁 배틀에 참여해보세요!" />
                <Link
                  to="/main/battle-list"
                  className="text-cusBlack-light text-xl font-medium justify-end mr-5"
                >
                  + <span className="font-bold">more</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battleList.length > 0 ? (
                  battleList.map((battle) => (
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
                          <div className="flex-1 flex flex-col px-1 xl:px-4">
                            <div className="flex-1 flex items-center mb-4">
                              <h3 className="text-lg font-semibold line-clamp-1 text-black">
                                {battle.title}
                              </h3>
                            </div>
                            <div className="flex justify-between items-center gap-2 xl:gap-4 mb-2">
                              <span className="text-cusBlue font-bold">
                                {battle.totalUsers}/6
                              </span>
                              <StatusBadge 
                                status={battle.status} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBattleEnter(battle.battleId, battle.status);
                                }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  [...Array(6)].map((_, index) => (
                    <Card key={`battle-${index}`} className="h-[160px]" />
                  ))
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;