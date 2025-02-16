import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion } from "framer-motion"; // 메인 Framer motion 추가
import { publicAxios, authAxios } from '../../common/axiosinstance';
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
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold w-[100px] text-center whitespace-nowrap";
  return status === 0 ? (
    <span 
      onClick={onClick}
      className={`${baseClasses} bg-cusRed-light text-cusBlack hover:bg-cusRed-dark cursor-pointer`}
    >
      입장하기
    </span>
  ) : (
    <div className={`${baseClasses} bg-cusLightBlue text-white pointer-events-none`}>
      진행 중
    </div>
  );
};

// 참가자 수를 위한 새로운 컴포넌트
const ParticipantsBadge = ({ current, max }) => {
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold pointer-events-none";
  return (
    <span className={`${baseClasses} bg-cusGray-light text-cusBlack`}>
      {current} / {max}
    </span>
  );
};

// 새로운 PopularVote 컴포넌트 추가
const PopularVote = ({ onVoteComplete }) => {
  const navigate = useNavigate();
  const [popularVote, setPopularVote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPopularVote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await publicAxios.get('/vote/list', {
        params: {
          page: 0,
          size: 10,  // 더 많은 데이터를 가져와서
          status: 'active',
          sort: 'createdAt,DESC'  // 일단 모든 active 투표를 가져온 다음
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data?.content) {
        // 투표수를 기준으로 정렬하고 가장 많은 것을 선택
        const sortedVotes = response.data.content.sort((a, b) => 
          b.totalVoteCount - a.totalVoteCount
        );
        
        if (sortedVotes[0]) {
          setPopularVote(sortedVotes[0]);  // 투표수가 가장 많은 투표를 선택
        }
      }
    } catch (error) {
      console.error('인기 투표 조회 중 오류 발생:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }

      await authAxios.post(`/vote/${popularVote.voteId}/vote/${optionId}`);
      await fetchPopularVote(); // 투표 후 데이터 새로고침
    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }
      alert('투표 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchPopularVote();
  }, []);

  if (loading || !popularVote) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[650px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="flex items-center px-4 py-2 bg-cusGray">
        <div className="flex-1 text-left">
          <h3 className="text-gray-800 font-bold">🔥 실시간 인기 투표</h3>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-cusRed-light"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="clay bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <Link 
                to={`/main/vote-detail/${popularVote.voteId}`}
                className="block"
                onClick={(e) => {
                  if (!localStorage.getItem('token')) {
                    e.preventDefault();
                    alert('로그인이 필요합니다.');
                    navigate('/main/login');
                  }
                }}
              >
                <h2 className="text-xl font-bold mb-3 hover:text-blue-600 cursor-pointer line-clamp-1">
                  {popularVote.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-2 line-clamp-2 text-sm">
                {popularVote.content}
              </p>
            </div>

            <div className="bg-gray-100 px-3 py-1 rounded-full shrink-0 ml-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {popularVote.totalVoteCount.toLocaleString()}명 참여중
              </span>
            </div>
          </div>

          {popularVote.hasVoted ? (
            // 투표 결과 보기
            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-red-500 font-medium">{popularVote.options[0].optionTitle}</span>
                <span className="text-blue-500 font-medium">{popularVote.options[1].optionTitle}</span>
              </div>
              <div className="relative h-12 clay bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full clay bg-red-500 flex items-center justify-start pl-2 text-white"
                  style={{ width: `${popularVote.options[0].votePercentage}%` }}
                >
                  {popularVote.options[0].votePercentage.toFixed(1)}%
                </div>
                <div
                  className="absolute right-0 top-0 h-full clay bg-blue-500 flex items-center justify-end pr-2 text-white"
                  style={{ width: `${popularVote.options[1].votePercentage}%` }}
                >
                  {popularVote.options[1].votePercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            // 투표 버튼
            <div className="flex gap-4">
              {popularVote.options.map((option) => (
                <button
                  key={option.optionId}
                  onClick={() => handleVote(option.optionId)}
                  className={`clay flex-1 p-4 ${
                    option.optionId === popularVote.options[0].optionId
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
    </div>
  );
};

const MainPage = () => {
  const [battleList, setBattleList] = useState([]);
  const [voteList, setVoteList] = useState([]); // 투표 목록 상태 추가
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo');
  const userId = userInfo ? JSON.parse(userInfo).userId : null;

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
          size: 2,
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

  const handleVote = async (vote, optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }

      // 즉시 UI 업데이트
      setVoteList(prevList => 
        prevList.map(v => {
          if (v.voteId === vote.voteId) {
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

      // UI 업데이트 후 서버 요청
      await authAxios.post(`/vote/${vote.voteId}/vote/${optionId}`);
      
    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
        return;
      }
      alert('투표 처리 중 오류가 발생했습니다.');
      await fetchVotes();
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

  const renderVoteResult = (vote) => {
    const totalVotes = vote.options.reduce((sum, option) => sum + option.voteCount, 0);
    
    return (
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
                style={{ width: `${totalVotes > 0 ? vote.options[0].votePercentage : 0}%` }}
              >
                {totalVotes > 0 ? vote.options[0].votePercentage.toFixed(1) : 0}%
              </div>
              <div
                className="absolute right-0 top-0 h-full clay bg-blue-500 flex items-center justify-end pr-2 text-white"
                style={{ width: `${totalVotes > 0 ? vote.options[1].votePercentage : 0}%` }}
              >
                {totalVotes > 0 ? vote.options[1].votePercentage.toFixed(1) : 0}%
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // 배틀룸 입장 처리 함수 수정
  const handleBattleEnter = (battleId, status) => {
    const token = localStorage.getItem('token');
    
    // 로그인 체크
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/main/login');  // /login -> /main/login 으로 수정
      return;
    }
    
    // 로그인된 상태면 배틀룸으로 이동
    navigate(`/battle-room/${battleId}`);  // /battle-room -> /main/battle-room 으로 수정
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
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        {/* PopularVote 컴포넌트 추가 */}
        <PopularVote />
        
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-14 pt-48 pb-12">
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
                <SectionTitle title="Battle" />
                <Link
                  to="/main/battle-list"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + 더보기
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battleList.length > 0 ? (
                  battleList.map((battle) => (
                    <div 
                      key={`battle-${battle.battleId}`}
                      className="block"
                    >
                      <div className="clay p-4 bg-white hover:scale-105 transition-transform h-[160px]">
                        <div className="flex h-full gap-4 flex-col sm:flex-row items-center">
                          {/* 썸네일 이미지 */}
                          <div className="w-full sm:w-24 h-24 flex-shrink-0">
                            <img 
                              src={battle.thumbnailUrl} 
                              alt={battle.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* 내용 */}
                          <div className="flex flex-col justify-between flex-grow">
                            {/* 제목 */}
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2">
                              {battle.title}
                            </h3>
                            
                            {/* 상태와 참가자 정보 */}
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                              <ParticipantsBadge current={battle.totalUsers} max={6} />
                              <StatusBadge status={battle.status} onClick={(e) => {
                                e.stopPropagation();
                                handleBattleEnter(battle.battleId, battle.status);
                              }} />
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

            {/* 메인 Framer motion 추가 */}
            <motion.section 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{
                ease: 'easeInOut',
                duration: 2,
                x: { duration: 2 },
              }}
              className="flex flex-col mb-24 vote-section"
            >
              <div className="flex justify-between items-center">
                <SectionTitle title="Vote" />
                <Link
                  to="/main/vote"  // /vote -> /main/vote 으로 수정
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + 더보기
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voteList.length > 0 ? (
                  voteList.map((vote) => (
                    <div key={vote.voteId} className="clay bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
                      <div 
                        onClick={() => handleVoteDetailClick(vote.voteId)}
                        className="cursor-pointer pt-2"
                      >
                        <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                          {vote.title}
                        </h2>
                        <p className="text-gray-600 mb-6">
                          {vote.content}
                        </p>
                      </div>

                      <div className="transition-all duration-300">
                        {vote.hasVoted ? (
                          renderVoteResult(vote)
                        ) : (
                          <div className="flex gap-4">
                            {vote.options.map((option) => (
                              <button
                                key={option.optionId}
                                onClick={() => handleVote(vote, option.optionId)}
                                className={`clay flex-1 p-3 ${
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
                  [...Array(2)].map((_, index) => (
                    <div key={`vote-skeleton-${index}`} className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
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
