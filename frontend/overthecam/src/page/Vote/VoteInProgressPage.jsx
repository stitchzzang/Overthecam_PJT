import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const VoteInProgressPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentList, setCurrentList] = useState([]);

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await publicAxios.get(`/vote/list`, {
        params: {
          page: page - 1,
          size: 5
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.content) {
        const mappedVotes = response.data.content.map(vote => ({
          ...vote,
          hasVoted: vote.hasVoted
        }));

        setVotes(mappedVotes);
        setTotalPages(response.data.pageInfo.totalPages);
        setCurrentList(mappedVotes);
      }
    } catch (err) {
      console.error('Error fetching votes:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setVotes([]);
        setCurrentList([]);
        setTotalPages(0);
      } else {
        alert('투표 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [page]);

  const handleVote = async (voteId, optionId) => {
    try {
      // 로컬 스토리지에서 사용자 정보 가져오기
      const userGender = localStorage.getItem('gender');
      const userAge = localStorage.getItem('age');
      
      const voteData = {
        optionId: optionId,
        userGender: userGender,
        userAge: userAge
      };

      await publicAxios.post(`/vote/${voteId}/vote/${optionId}`, voteData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 투표 후 최신 데이터로 업데이트
      await fetchVotes();
    } catch (err) {
      alert('투표 처리 중 오류가 발생했습니다.');
    }
  };

  const calculateNewPercentages = (options, selectedOptionId) => {
    const totalVotes = options.reduce((sum, option) => sum + option.voteCount, 0) + 1;
    return options.map(option => 
      option.optionId === selectedOptionId 
        ? ((option.voteCount + 1) / totalVotes) * 100 
        : (option.voteCount / totalVotes) * 100
    );
  };

  const handleError = (err) => {
    console.error('Error:', err);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-[800px] mx-auto p-4">
      {/* 그라데이션 헤더 */}
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      {/* 투표 목록 */}
      <div className="space-y-4 mt-4">
        {currentList.map((vote) => (
          <div key={vote.voteId} className="bg-white rounded-lg shadow-lg p-6">
            {/* 투표 제목 - 클릭 시 디테일 페이지로 이동 */}
            <Link to={`/vote-detail/${vote.voteId}`}>
              <h2 className="text-xl font-bold mb-4 hover:text-blue-600 cursor-pointer">
                {vote.title}
              </h2>
            </Link>
            
            {/* 투표 내용 */}
            <p className="text-gray-600 mb-4">{vote.content}</p>

            {/* 투표 옵션 - hasVoted로 참여 여부 확인 */}
            {vote.hasVoted ? (
              // 이미 투표한 경우 - 결과 그래프 표시
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <div className="text-red-500">A. {vote.options[0].optionTitle}</div>
                  <div className="text-blue-500">B. {vote.options[1].optionTitle}</div>
                </div>
                <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-red-400 flex items-center justify-start pl-4 text-white font-bold"
                    style={{ width: `${vote.options[0].votePercentage}%` }}
                  >
                    {Math.round(vote.options[0].votePercentage)}%
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full bg-blue-400 flex items-center justify-end pr-4 text-white font-bold"
                    style={{ width: `${vote.options[1].votePercentage}%` }}
                  >
                    {Math.round(vote.options[1].votePercentage)}%
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{vote.options[0].voteCount}표</span>
                  <span>{vote.options[1].voteCount}표</span>
                </div>
              </div>
            ) : (
              // 아직 투표하지 않은 경우 - 투표 버튼 표시
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => handleVote(vote.voteId, vote.options[0].optionId)}
                  className="flex-1 p-4 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg transition-colors"
                >
                  {vote.options[0].optionTitle}
                </button>
                <button
                  onClick={() => handleVote(vote.voteId, vote.options[1].optionId)}
                  className="flex-1 p-4 bg-blue-100 hover:bg-blue-200 text-blue-500 rounded-lg transition-colors"
                >
                  {vote.options[1].optionTitle}
                </button>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{vote.creatorNickname}</span>
              <span>·</span>
              <span>댓글 {vote.commentCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ItemShopPage와 동일한 페이지네이션 */}
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