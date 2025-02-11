import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';  // authAxios 추가

const VoteInProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentList, setCurrentList] = useState([]);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await (token ? authAxios : publicAxios).get('/vote/list', {
        params: {
          page: page - 1,
          size: 5
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response:', response.data);  // 디버깅용 로그

      if (response.data?.data?.content) {
        setCurrentList(response.data.data.content);
        setTotalPages(response.data.data.pageInfo.totalPages);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);  // 디버깅용 로그
      setCurrentList([]);
      setTotalPages(0);
      setError('투표 목록을 불러오는데 실패했습니다.');
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

      const response = await authAxios.post(`/vote/${vote.voteId}/vote/${optionId}`);

      // Immediately fetch the updated vote data after voting
      const updatedVoteResponse = await authAxios.get(`/vote/list`, {
        params: {
          page: page - 1,
          size: 5
        }
      });

      if (updatedVoteResponse.data?.data?.content) {
        setCurrentList(updatedVoteResponse.data.data.content);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        console.error('Vote error:', err);
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
            className="absolute left-0 top-0 h-full bg-red-400 flex items-center justify-start pl-4 text-white font-bold transition-all"
            style={{ width: `${vote.options[0].votePercentage}%` }}
          >
            {Math.round(vote.options[0].votePercentage)}%
          </div>
          <div
            className="absolute right-0 top-0 h-full bg-blue-400 flex items-center justify-end pr-4 text-white font-bold transition-all"
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
                  <button
                    onClick={() => handleVote(vote, vote.options[0].optionId)}
                    className="flex-1 p-4 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg transition-colors"
                  >
                    {vote.options[0].optionTitle}
                  </button>
                  <button
                    onClick={() => handleVote(vote, vote.options[1].optionId)}
                    className="flex-1 p-4 bg-blue-100 hover:bg-blue-200 text-blue-500 rounded-lg transition-colors"
                  >
                    {vote.options[1].optionTitle}
                  </button>
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