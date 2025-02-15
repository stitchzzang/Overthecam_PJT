import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';
import Pagination from 'react-js-pagination';

const VotePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            <div className="text-right text-sm text-gray-600 mt-2">
              총 투표수: {totalVotes}
            </div>
          </>
        )}
      </div>
    );
  };

  const shouldShowVoteButtons = (vote) => {
    return vote.active && !vote.hasVoted;
  };

  const shouldShowVoteResult = (vote) => {
    // 투표가 종료되었거나(ended), 사용자가 투표했거나(hasVoted)인 경우 결과를 보여줌
    return voteStatus === 'ended' || !vote.active || vote.hasVoted;
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
      
      <div className="container mx-auto px-4 md:px-6 max-w-6xl mt-4">
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
        
        <div className="space-y-4 mt-4">
          {currentList.map((vote) => (
            <div key={vote.voteId} className="clay bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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
                {shouldShowVoteResult(vote) ? (
                  renderVoteResult(vote)
                ) : shouldShowVoteButtons(vote) ? (
                  <div className="flex gap-4 mb-4">
                    {vote.options.map((option) => (
                      <button
                        key={option.optionId}
                        onClick={() => handleVote(vote, option.optionId)}
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
                ) : null}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{vote.creatorNickname}</span>
                <span>·</span>
                <span>댓글 {vote.commentCount}</span>
              </div>
            </div>
          ))}
        </div>
        </div>
        <div className="flex justify-center p-4 mt-2">
          <Pagination
            activePage={pages[voteStatus]}
            itemsCountPerPage={10}
            totalItemsCount={totalPages[voteStatus] * 10}
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
      </div>
    </div>
  );
};

export default VotePage;