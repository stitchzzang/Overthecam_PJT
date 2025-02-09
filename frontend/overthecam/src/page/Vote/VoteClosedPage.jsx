import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const CustomPagination = ({ activePage, itemsCountPerPage, totalItemsCount, onChange }) => {
  // ...VoteInProgressPage의 CustomPagination 컴포넌트와 동일...
};

const VoteClosedPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchVotes();
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
        console.log('모든 투표:', response.data.content); // 디버깅용
        
        // Filter only inactive votes (active가 false인 것만 필터링)
        const closedVotes = response.data.content.filter(vote => {
          console.log(`투표 ${vote.voteId}의 active 상태:`, vote.active); // 디버깅용
          return vote.active === false;
        });
        
        console.log('종료된 투표:', closedVotes); // 디버깅용
        
        setVotes(closedVotes);
        const start = (page - 1) * itemsPerPage;
        setCurrentList(closedVotes.slice(start, start + itemsPerPage));
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
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
    <div>
      {/* 그라데이션 헤더 추가 */}
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      <div className="p-4">
        {currentList.length > 0 ? (
          currentList.map(vote => (
            <div key={vote.voteId} className="mb-8 p-4 border rounded-lg shadow">
              <h3 
                className="text-xl font-bold mb-4 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/vote-detail/${vote.voteId}`)}
              >
                {vote.title}
              </h3>
              <p className="mb-4">{vote.content}</p>
              
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
            </div>
          ))
        ) : (
          <div className="text-center py-8">종료된 투표가 없습니다.</div>
        )}
        <div className="flex justify-center pb-10">
          <CustomPagination
            activePage={page}
            itemsCountPerPage={itemsPerPage}
            totalItemsCount={votes.length}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VoteClosedPage;
