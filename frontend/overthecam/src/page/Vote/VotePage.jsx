import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';

const VotePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [voteStatus, setVoteStatus] = useState('all'); // 'all', 'active', 'ended'

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await publicAxios.get('/vote/list', { 
        params: {
          page: page - 1,
          size: 5,
          includeVoteResult: true,
          status: voteStatus === 'all' ? null : voteStatus
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data?.content) {
        setCurrentList(response.data.content);
        setTotalPages(response.data.pageInfo.totalPages);
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
  }, [page, voteStatus]);
  
  const handleVote = async (vote, optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
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
      alert('투표 처리 중 오류가 발생했습니다.');
      // 에러 발생 시 원래 상태로 복구
      await fetchVotes();
    }
  };

  const renderVoteResult = (vote) => (
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
          <div className="text-right text-sm text-gray-600 mt-2">
            총 투표수: {vote.options.reduce((sum, option) => sum + option.voteCount, 0)}
          </div>
        </>
      )}
    </div>
  );

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="vote-main-page bg-cusGray-light min-h-screen pb-14">
      <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue p-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
          Vote
        </h1>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div>
        <div className="flex justify-between items-center mt-6 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setVoteStatus('all')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              전체보기
            </button>
            <button
              onClick={() => setVoteStatus('active')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'active'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => setVoteStatus('ended')}
              className={`btn px-6 py-2 text-md rounded-full transition-colors ${
                voteStatus === 'ended'
                  ? 'bg-gray-600 text-white'
                  : 'bg-cusGray-light text-gray-700 hover:bg-cusGray'
              }`}
            >
              종료됨
            </button>
          </div>
          <Link
            to="/create-vote"
            state={{ from: '/vote' }}
            className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
          >
            투표 만들기
          </Link>
        </div>
        
        <div className="space-y-4 mt-4">
          {currentList.map((vote) => (
            <div key={vote.voteId} className="clay bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <Link to={`/vote-detail/${vote.voteId}`}>
                <h2 className="text-xl font-bold mb-4 hover:text-blue-600 cursor-pointer">
                  {vote.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-4">{vote.content}</p>

              <div className="transition-all duration-300">
                {Boolean(vote.hasVoted) ? (
                  renderVoteResult(vote)
                ) : (
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
                )}
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
        <div className="flex justify-center mt-6 pb-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {'<<'}
            </button>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {'<'}
            </button>
            <span className="mx-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {'>'}
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotePage;