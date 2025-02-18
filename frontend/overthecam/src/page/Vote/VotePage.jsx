import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';
import Pagination from 'react-js-pagination';

const VotePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalElements: 0,
    pageSize: 10
  });
  const [pages, setPages] = useState({
    all: 1,
    active: 1,
    ended: 1
  });
  const [currentList, setCurrentList] = useState([]);
  const [totalPages, setTotalPages] = useState({
    all: 0,
    active: 0,
    ended: 0
  });
  const [voteStatus, setVoteStatus] = useState('all');
  const [showMyVotes, setShowMyVotes] = useState(false);
  const userInfo = localStorage.getItem('userInfo');
  const userId = userInfo ? JSON.parse(userInfo).userId : null;

  const createConfetti = (isFirstOption) => {
    const emojis = isFirstOption 
      ? ['🍎', '🧧', '❤️', '🍒', '🎀','🍬','👺']
      : ['💙', '🐠', '🥶', '🌍', '💎','🐬','❄️'];
  
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

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 전체 데이터를 한번에 가져오기
      const params = {
        page: 0,
        size: 1000, // 충분히 큰 수
        status: voteStatus === 'all' ? undefined : voteStatus
      };
      
      const response = await publicAxios.get('/vote/list', { 
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data?.content) {
        // 1. 먼저 필터링
        const filteredContent = showMyVotes && userId
          ? response.data.content.filter(vote => Number(vote.creatorUserId) === Number(userId))
          : response.data.content;

        // 2. 페이지네이션 계산
        const startIndex = (pages[voteStatus] - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedContent = filteredContent.slice(startIndex, endIndex);
        
        setCurrentList(paginatedContent);
        setPageInfo({
          totalPages: Math.ceil(filteredContent.length / 10),
          totalElements: filteredContent.length,
          pageSize: 10
        });
        setTotalPages(prev => ({
          ...prev,
          [voteStatus]: Math.ceil(filteredContent.length / 10)
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('투표 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVotes();
  }, [pages[voteStatus], voteStatus, showMyVotes]);

  const handlePageChange = (newPage) => {
    setPages(prev => ({
      ...prev,
      [voteStatus]: newPage
    }));
  };

  const handleStatusChange = (newStatus) => {
    // 페이지를 1로 리셋
    setPages(prev => ({
      ...prev,
      [newStatus]: 1
    }));
    setVoteStatus(newStatus);
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
      setCurrentList(prevList => 
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

  const handleMyVotesToggle = () => {
    setShowMyVotes(!showMyVotes);
    setPages(prev => ({
      ...prev,
      [voteStatus]: 1
    }));
  };

  const renderVoteResult = (vote) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <div className="text-cusRed font-bold text-lg">
            A. {vote.options[0].optionTitle}
          </div>
          <div className="text-cusBlue font-bold text-lg">
            B. {vote.options[1].optionTitle}
          </div>
        </div>
        <div className="relative h-12 rounded-full overflow-hidden">
          {vote.options[0].votePercentage > 0 && (
            <div
              className="absolute left-0 top-0 h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold text-lg"
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
              className="absolute right-0 top-0 h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold text-lg"
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
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="vote-main-page bg-cusGray-light min-h-screen pb-14">
      <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue p-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
          투표
        </h1>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 max-w-4xl mt-4">
        <div>
        <div className="flex justify-between items-center mt-8 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusChange('all')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              전체보기
            </button>
            <button
              onClick={() => handleStatusChange('active')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'active'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => handleStatusChange('ended')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'ended'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              종료됨
            </button>
          </div>
          <div className="flex items-center gap-4">
            {userId && (
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMyVotes}
                    onChange={handleMyVotesToggle}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {loading ? '로딩중...' : '내 투표만'}
                  </span>
                </label>
              </div>
            )}
            <Link
              to="/main/create-vote"
              state={{ from: '/main/vote' }}
              className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
            >
              투표 만들기
            </Link>
          </div>
        </div>
        
        {currentList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentList.map((vote) => (
                <div key={vote.voteId} className="clay bg-white rounded-lg shadow-lg p-6">
                  <Link 
                    to={`/main/vote-detail/${vote.voteId}`}
                    onClick={(e) => {
                      if (!localStorage.getItem('token')) {
                        e.preventDefault();
                        alert('로그인이 필요합니다.');
                        navigate('/main/login');
                      }
                    }}
                    className="text-xl font-bold mb-4 hover:text-blue-600 cursor-pointer"
                  >
                    <h2 className="text-xl font-bold mb-4 hover:text-blue-600 cursor-pointer">
                      {vote.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-4">{vote.content}</p>

                  <div className="transition-all duration-300">
                    {vote.hasVoted ? (
                      renderVoteResult(vote)
                    ) : (
                      <div className="flex gap-4 mb-4">
                        {vote.options.map((option) => (
                          <button
                            id={`vote-button-${option.optionId}`}
                            key={option.optionId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(vote.voteId, option.optionId);
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
              ))}
            </div>
            
            {/* 모든 상태에서 항상 페이지네이션 표시 */}
            <div className="flex justify-center mt-6">
              <Pagination
                activePage={pages[voteStatus]}
                itemsCountPerPage={10}
                totalItemsCount={pageInfo.totalElements}
                pageRangeDisplayed={5}
                prevPageText={"이전"}
                nextPageText={"다음"}
                onChange={handlePageChange}
                innerClass="flex gap-2"
                itemClass="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
                activeClass="bg-cusBlack-light !text-white"
                linkClass="block w-full h-full text-center"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl text-gray-500 font-medium">
              {voteStatus === 'all' ? '현재 투표가 없습니다.' :
               voteStatus === 'active' ? '현재 진행중인 투표가 없습니다.' :
               '종료된 투표가 없습니다.'}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default VotePage;