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
const PopularVote = ({ onVoteUpdate }) => {
  const navigate = useNavigate();
  const [popularVote, setPopularVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popularVoteKey, setPopularVoteKey] = useState(0); // PopularVote 컴포넌트 리렌더링을 위한 key

  const fetchPopularVote = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 먼저 전체 페이지 수를 알아내기 위한 요청
      const initialResponse = await publicAxios.get('/vote/list', {
        params: {
          page: 0,
          size: 1,
          status: 'active'
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!initialResponse.data?.pageInfo?.totalPages) {
        return;
      }

      // 모든 active 투표를 가져오기 위한 요청
      const allVotesResponse = await publicAxios.get('/vote/list', {
        params: {
          page: 0,
          size: initialResponse.data.pageInfo.totalElements, // 전체 투표 개수만큼 size 설정
          status: 'active'
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (allVotesResponse.data?.content) {
        // 투표수로 정렬하여 가장 많은 투표를 선택
        const sortedVotes = allVotesResponse.data.content.sort((a, b) => 
          b.totalVoteCount - a.totalVoteCount
        );
        
        if (sortedVotes[0]) {
          setPopularVote(sortedVotes[0]);
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
      if (!popularVote) return;
      await onVoteUpdate(popularVote.voteId, optionId);
    } catch (err) {
      console.error('Popular vote error:', err);
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
            <div>
              <div className="mb-2 flex justify-between">
                <div className="text-cusRed font-bold">
                  A. {popularVote.options[0].optionTitle}
                </div>
                <div className="text-cusBlue font-bold">
                  B. {popularVote.options[1].optionTitle}
                </div>
              </div>
              <div className="relative h-12 clay bg-gray-200 rounded-full overflow-hidden">
                {popularVote.options[0].votePercentage > 0 && (
                  <div
                    className="absolute left-0 top-0 h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold"
                    style={{ width: `${popularVote.options[0].votePercentage >= 100 ? 100 : popularVote.options[0].votePercentage}%` }}
                  >
                    {Math.round(popularVote.options[0].votePercentage)}% ({popularVote.options[0].voteCount}명)
                  </div>
                )}
                {popularVote.options[1].votePercentage > 0 && (
                  <div
                    className="absolute right-0 top-0 h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold"
                    style={{ width: `${popularVote.options[1].votePercentage >= 100 ? 100 : popularVote.options[1].votePercentage}%` }}
                  >
                    {Math.round(popularVote.options[1].votePercentage)}% ({popularVote.options[1].voteCount}명)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              {popularVote.options.map((option) => (
                <button
                  key={option.optionId}
                  onClick={() => handleVote(option.optionId)}
                  className={`clay flex-1 p-4 ${
                    option.optionId === popularVote.options[0].optionId
                      ? 'bg-red-100 hover:bg-red-200 text-cusRed'
                      : 'bg-blue-100 hover:bg-blue-200 text-cusBlue'
                  } rounded-lg transition-colors text-lg font-bold`}
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
  const [voteList, setVoteList] = useState([]);
  const [popularVoteKey, setPopularVoteKey] = useState(0); // PopularVote 컴포넌트 리렌더링을 위한 key
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

  const renderVoteResult = (vote) => {
    const totalVotes = vote.options.reduce((sum, option) => sum + option.voteCount, 0);
    
    return (
      <div className="mb-4">
        {vote.options && vote.options.length >= 2 && (
          <>
            <div className="flex justify-between mb-2">
              <div className="text-cusRed font-bold">
                A. {vote.options[0].optionTitle}
              </div>
              <div className="text-cusBlue font-bold">
                B. {vote.options[1].optionTitle}
              </div>
            </div>
            <div className="relative h-12 clay bg-gray-200 rounded-full overflow-hidden">
              {vote.options[0].votePercentage > 0 && (
                <div
                  className="absolute left-0 top-0 h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold"
                  style={{ width: `${vote.options[0].votePercentage >= 100 ? 100 : vote.options[0].votePercentage}%` }}
                >
                  {Math.round(vote.options[0].votePercentage)}% ({vote.options[0].voteCount}명)
                </div>
              )}
              {vote.options[1].votePercentage > 0 && (
                <div
                  className="absolute right-0 top-0 h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold"
                  style={{ width: `${vote.options[1].votePercentage >= 100 ? 100 : vote.options[1].votePercentage}%` }}
                >
                  {Math.round(vote.options[1].votePercentage)}% ({vote.options[1].voteCount}명)
                </div>
              )}
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
        
        {/* PopularVote 컴포넌트에 key와 handleVoteUpdate 전달 */}
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
                      <div className="clay p-4 pr-8 bg-white hover:scale-105 transition-transform h-[160px]">
                        <div className="flex h-full gap-6 flex-col sm:flex-row items-center">
                          {/* 썸네일 이미지 */}
                          <div className="w-full sm:w-24 h-24 flex-shrink-0 ml-4">
                            <img 
                              src={battle.thumbnailUrl} 
                              alt={battle.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* 내용 */}
                          <div className="flex flex-col justify-between flex-grow w-full pl-2">
                            {/* 제목 */}
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2 text-center sm:text-left">
                              {battle.title}
                            </h3>
                            
                            {/* 상태와 참가자 정보 */}
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 w-full">
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
                  to="/main/vote"
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
                        <p className="text-gray-600 mb-3">
                          {vote.content}
                        </p>
                      </div>

                      <div className="transition-all duration-300">
                        {vote.hasVoted ? (
                          renderVoteResult(vote)
                        ) : (
                          <div className="flex gap-4 mb-4">
                            {vote.options.map((option) => (
                              <button
                                key={option.optionId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVoteUpdate(vote.voteId, option.optionId);
                                }}
                                className={`clay flex-1 p-3 ${
                                  option.optionId === vote.options[0].optionId
                                    ? 'bg-red-100 hover:bg-red-200 text-red-500'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-500'
                                } rounded-lg transition-colors text-lg font-bold`}
                              >
                                {option.optionTitle}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* 투표 여부와 관계없이 항상 표시되는 정보 */}
                        <div className="flex justify-between items-center text-sm text-gray-500">
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
                  [...Array(6)].map((_, index) => (
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