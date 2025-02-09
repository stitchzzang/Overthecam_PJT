import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const CustomPagination = ({ activePage, itemsCountPerPage, totalItemsCount, onChange }) => {
  const totalPages = Math.ceil(totalItemsCount / itemsCountPerPage);
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={`page-${i}`}
        onClick={() => onChange(i)}
        className={`px-4 py-2 rounded-lg transition ${
          activePage === i 
            ? 'bg-cusBlack-light text-white' 
            : 'text-cusBlack-light hover:bg-gray-300'
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {activePage > 1 && (
        <button onClick={() => onChange(activePage - 1)} className="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition">
          이전
        </button>
      )}
      {pages}
      {activePage < totalPages && (
        <button onClick={() => onChange(activePage + 1)} className="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition">
          다음
        </button>
      )}
    </div>
  );
};

const VoteInProgressPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const [votedItems, setVotedItems] = useState(new Set());
  const itemsPerPage = 5;

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
      const response = await publicAxios.get('/vote/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data?.content) {
        const mappedVotes = response.data.content.map(vote => ({
          ...vote,
          hasVoted: vote.options.some(option => option.voteCount > 0)
        }));

        setVotes(mappedVotes);
        const start = (page - 1) * itemsPerPage;
        setCurrentList(mappedVotes.slice(start, start + itemsPerPage));
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote, optionId) => {
    if (votedItems.has(vote.voteId)) {
      alert('이미 참여한 투표입니다.');
      return;
    }

    try {
      // 즉시 UI 업데이트
      const newVotedItems = new Set(votedItems).add(vote.voteId);
      setVotedItems(newVotedItems);
      localStorage.setItem('votedItems', JSON.stringify([...newVotedItems]));

      // 현재 투표의 상태를 즉시 업데이트
      const updatedVotes = votes.map(v => {
        if (v.voteId === vote.voteId) {
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
      const start = (page - 1) * itemsPerPage;
      setCurrentList(updatedVotes.slice(start, start + itemsPerPage));

      // 서버에 투표 요청
      await publicAxios.post(`/vote/${vote.voteId}/vote/${optionId}`, null, {
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
          newSet.delete(vote.voteId);
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const start = (newPage - 1) * itemsPerPage;
    setCurrentList(votes.slice(start, start + itemsPerPage));
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      {currentList.map(vote => (
        <div key={vote.voteId} className="mb-8 p-4 border rounded-lg shadow">
          <h3 
            className="text-xl font-bold mb-4 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/vote-detail/${vote.voteId}`)}
          >
            {vote.title}
          </h3>
          <p className="mb-4">{vote.content}</p>
          
          {!votedItems.has(vote.voteId) ? (
            <div className="flex gap-4">
              {vote.options.map((option, index) => (
                <button
                  key={option.optionId}
                  onClick={() => handleVote(vote, option.optionId)}
                  className={`flex-1 h-12 px-4 py-2 text-white rounded transition ${
                    index === 0 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {option.optionTitle}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <div className="mb-2 flex justify-between">
                <span className="text-red-500 font-medium">{vote.options[0].optionTitle}</span>
                <span className="text-blue-500 font-medium">{vote.options[1].optionTitle}</span>
              </div>
              <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-red-500 flex items-center justify-start pl-2 text-white"
                  style={{ width: `${vote.options[0].votePercentage}%` }}
                >
                  {vote.options[0].votePercentage.toFixed(1)}%
                </div>
                <div
                  className="absolute right-0 top-0 h-full bg-blue-500 flex items-center justify-end pr-2 text-white"
                  style={{ width: `${vote.options[1].votePercentage}%` }}
                >
                  {vote.options[1].votePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-2">
                총 투표수: {vote.options.reduce((sum, option) => sum + option.voteCount, 0)}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-center pb-10">
        <CustomPagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={votes.length}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default VoteInProgressPage;