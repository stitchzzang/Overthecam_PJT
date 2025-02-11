import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';

const VoteInProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentList, setCurrentList] = useState([]);

  let retryCount = 0;
  const maxRetries = 3;

  // 로컬 스토리지에서 투표 정보를 가져오는 함수
  const getVotedItems = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return {};
    
    const userId = JSON.parse(userInfo).userId;
    const votedItems = localStorage.getItem(`votedItems_${userId}`);
    return votedItems ? JSON.parse(votedItems) : {};
  };

  // 투표 정보를 로컬 스토리지에 저장하는 함수
  const saveVotedItem = (voteId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    
    const userId = JSON.parse(userInfo).userId;
    const votedItems = getVotedItems();
    votedItems[voteId] = true;
    localStorage.setItem(`votedItems_${userId}`, JSON.stringify(votedItems));
  };

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const votedItems = getVotedItems();

      if (token) {
        // 토큰 유효성 검사 (간단한 형태)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          localStorage.removeItem('token');
          setError('유효하지 않은 토큰입니다. 다시 로그인해주세요.');
          return;
        }
      }

      if (!navigator.onLine) {
        setError('인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.');
        return;
      }

      const response = await (token ? authAxios : publicAxios).get('/vote/list', {
        params: {
          page: page - 1,
          size: 5,
          includeVoteResult: true
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response:', response.data);

      if (response.data?.data?.content) {
        const votesWithResults = response.data.data.content.map(vote => ({
          ...vote,
          hasVoted: vote.hasVoted || votedItems[vote.voteId] === true,
          options: vote.options.map(option => ({
            ...option,
            votePercentage: option.votePercentage || 0
          }))
        }));
        setCurrentList(votesWithResults);
        setTotalPages(response.data.data.pageInfo.totalPages);
        setError(null);
      } else {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return fetchVotes();
      }
      console.error('Fetch error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack
      });
      setCurrentList([]);
      setTotalPages(0);
      
      // 에러 메시지 구체화
      if (err.response) {
        if (err.response.status === 401) {
          setError('로그인이 필요합니다.');
        } else if (err.response.status === 404) {
          setError('투표 목록을 찾을 수 없습니다.');
        } else {
          setError('서버 오류가 발생했습니다.');
        }
      } else if (err.request) {
        setError('서버와의 연결에 실패했습니다.');
      } else {
        setError('투표 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [page]);

  const handleVote = async (vote, optionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      if (vote.hasVoted) {
        return;
      }

      const response = await authAxios.post(`/vote/${vote.voteId}/vote/${optionId}`);

      if (response.status === 200) {
        saveVotedItem(vote.voteId);
        await fetchVotes();
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'DUPLICATE_VOTE') {
        saveVotedItem(vote.voteId);
        await fetchVotes();
      } else if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const renderVoteResult = (vote) => (
    <div className="mb-4">
      {vote.options && vote.options.length >= 2 && (
        <>
          <div className="flex justify-between mb-4 text-xl">
            <div className="text-red-500">A. {vote.options[0].optionTitle}</div>
            <div className="text-blue-500">B. {vote.options[1].optionTitle}</div>
          </div>
          <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-red-400 flex items-center justify-start pl-4 text-white font-bold transition-all duration-300"
              style={{ width: `${vote.options[0].votePercentage}%` }}
            >
              {Math.round(vote.options[0].votePercentage)}%
            </div>
            <div
              className="absolute right-0 top-0 h-full bg-blue-400 flex items-center justify-end pr-4 text-white font-bold transition-all duration-300"
              style={{ width: `${vote.options[1].votePercentage}%` }}
            >
              {Math.round(vote.options[1].votePercentage)}%
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      <div className="space-y-4 mt-4">
        {currentList.map((vote) => (
          <div key={vote.voteId} className="bg-white rounded-lg shadow-lg p-6">
            <Link to={`/vote-detail/${vote.voteId}`}>
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
                      key={option.optionId}
                      onClick={() => handleVote(vote, option.optionId)}
                      className={`flex-1 p-4 ${
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
  );
};

export default VoteInProgressPage;