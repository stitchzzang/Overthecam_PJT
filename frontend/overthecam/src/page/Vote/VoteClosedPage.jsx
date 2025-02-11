import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const CustomPagination = ({ activePage, itemsCountPerPage, totalItemsCount, onChange }) => {
  // ...VoteInProgressPage의 CustomPagination 컴포넌트와 동일...
};

const VoteClosedPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!navigator.onLine) {
        setError('인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.');
        return;
      }

      // active=false 파라미터 추가
      const response = await publicAxios.get('/vote/list', {
        params: {
          page: page - 1,
          size: 5,
          includeVoteResult: true,
          active: false  // 비활성화(종료된) 투표만 가져오기
        }
      });

      // 혹시 모르니 한번 더 필터링
      if (response.data?.content) {
        const votesWithResults = response.data.content
          .filter(vote => !vote.active)  // active가 false인 것만 필터링
          .map(vote => ({
            ...vote,
            options: vote.options.map(option => ({
              ...option,
              votePercentage: option.votePercentage || 0
            }))
          }));
        setCurrentList(votesWithResults);
        setTotalPages(response.data.pageInfo.totalPages);
        setError(null);
      } else {
        throw new Error('데이터 형식이 올바르지 않습니다.');
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
    fetchVotes();
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
            totalItemsCount={totalPages * itemsPerPage}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VoteClosedPage;
