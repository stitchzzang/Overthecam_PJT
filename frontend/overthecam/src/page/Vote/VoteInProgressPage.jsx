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
  const [votedItems, setVotedItems] = useState(new Set());
  const itemsPerPage = 5;
  const currentUserId = localStorage.getItem('userId'); // 현재 로그인한 사용자의 ID

  useEffect(() => {
    fetchVotes();
    // 로컬 스토리지에서 이전 투표 기록 불러오기
    const savedVotes = localStorage.getItem('votedItems');
    if (savedVotes) {
      setVotedItems(new Set(JSON.parse(savedVotes)));
    }
  }, []);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const response = await publicAxios.get(`/vote/list?page=${page-1}&size=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data?.content) {
        const mappedVotes = response.data.content.map(vote => ({
          ...vote,
          hasVoted: vote.hasVoted,
          userId: vote.userId  // API에서 userId 받아오기
        }));

        setVotes(mappedVotes);
        setTotalPages(response.data.pageInfo.totalPages);
        setCurrentList(mappedVotes);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [page]);

  const handleVote = async (voteId, optionId) => {
    if (votedItems.has(voteId)) {
      alert('이미 참여한 투표입니다.');
      return;
    }

    try {
      // 즉시 UI 업데이트
      const newVotedItems = new Set(votedItems).add(voteId);
      setVotedItems(newVotedItems);
      localStorage.setItem('votedItems', JSON.stringify([...newVotedItems]));

      // 현재 투표의 상태를 즉시 업데이트
      const updatedVotes = votes.map(v => {
        if (v.voteId === voteId) {
          const updatedOptions = v.options.map(option => ({
            ...option,
            voteCount: option.optionId === optionId ? option.voteCount + 1 : option.voteCount
          }));
          
          // 전체 투표 수 계산
          const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.voteCount, 0);
          
          // 각 옵션의 퍼센테이지 계산
          const optionsWithPercentages = updatedOptions.map(opt => ({
            ...opt,
            votePercentage: (opt.voteCount / totalVotes) * 100
          }));

          return {
            ...v,
            hasVoted: true,
            options: optionsWithPercentages
          };
        }
        return v;
      });

      setVotes(updatedVotes);
      setCurrentList(updatedVotes);

      // 서버에 투표 요청
      await publicAxios.post(`/vote/${voteId}/vote/${optionId}`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 서버에서 최신 데이터 가져오기
      await fetchVotes();
    } catch (err) {
      if (err.response?.status === 500) {
        alert('이미 참여한 투표입니다.');
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
        // 에러 발생 시 UI 롤백
        setVotedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(voteId);
          localStorage.setItem('votedItems', JSON.stringify([...newSet]));
          return newSet;
        });
      }
      // 서버에서 최신 데이터로 다시 동기화
      await fetchVotes();
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

  const handleDelete = async (voteId) => {
    if (window.confirm('정말로 이 투표를 삭제하시겠습니까?')) {
      try {
        await publicAxios.delete(`/api/vote/${voteId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // 삭제 후 목록 새로고침
        fetchVotes();
      } catch (error) {
        if (error.response?.status === 403) {
          alert('자신이 작성한 투표만 삭제할 수 있습니다.');
        } else {
          alert('투표 삭제에 실패했습니다.');
        }
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-[800px] mx-auto p-4">
      {/* 그라데이션 헤더 추가 */}
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      {/* 투표 목록 */}
      <div className="space-y-4 mt-4">
        {currentList.map((vote) => (
          <div key={vote.voteId} className="bg-white rounded-lg shadow-lg p-6">
            {/* 투표 제목 */}
            <h2 className="text-xl font-bold mb-4">{vote.title}</h2>
            
            {/* 투표 내용 */}
            <p className="text-gray-600 mb-4">{vote.content}</p>

            {/* 투표 옵션 - hasVoted로 참여 여부 확인 */}
            {vote.hasVoted ? (
              // 이미 투표한 경우 - 결과 그래프 표시
              <div className="mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>{vote.options[0].optionTitle}</span>
                  <span>{vote.options[1].optionTitle}</span>
                </div>
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-red-400 flex items-center justify-start pl-2 text-white text-sm"
                    style={{ width: `${vote.options[0].votePercentage}%` }}
                  >
                    {vote.options[0].votePercentage}%
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full bg-blue-400 flex items-center justify-end pr-2 text-white text-sm"
                    style={{ width: `${vote.options[1].votePercentage}%` }}
                  >
                    {vote.options[1].votePercentage}%
                  </div>
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

            {/* 메타 정보 - userId로 검증하여 삭제 버튼 표시 */}
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>{vote.creatorNickname}</span>
                <span>·</span>
                <span>댓글 {vote.commentCount}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentUserId === vote.userId && (  // userId로 검증
                  <button
                    onClick={() => handleDelete(vote.voteId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
                <Link 
                  to={`/vote-detail/${vote.voteId}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  자세히 보기
                </Link>
              </div>
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