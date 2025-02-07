import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';
import Pagination from 'react-js-pagination';

const VoteClosedPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get('/vote/list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('API Response:', response.data);
        if (response.data && response.data.content) {
          // Filter only inactive votes
          const closedVotes = response.data.content.filter(vote => !vote.active);
          setVotes(closedVotes);
          setError(null);
        } else {
          setError('투표 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Fetch error details:', error.response || error);
        if (error.code === 'ERR_NETWORK') {
          setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
        } else if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { state: { from: '/vote' } });
        } else {
          setError('투표 목록을 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [navigate]);

  useEffect(() => {
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentList(votes.slice(indexOfFirstItem, indexOfLastItem));
  }, [page, votes]);

  const changePageHandler = (page) => {
    setPage(page);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      {currentList.length > 0 ? (
        currentList.map(vote => (
          <div key={vote.voteId} className="mb-8 p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4 cursor-pointer hover:text-blue-600" 
                onClick={() => navigate(`/vote-detail/${vote.voteId}`)}>
              {vote.title}
            </h3>
            {vote.content && <p className="mb-4 text-gray-600">{vote.content}</p>}
            
            {vote.options && (
              <div className="relative pt-6">
                {/* Option Labels */}
                <div className="flex justify-between mb-2">
                  <span className="text-red-500 font-semibold">
                    {vote.options[0]?.optionTitle}
                  </span>
                  <span className="text-blue-500 font-semibold">
                    {vote.options[1]?.optionTitle}
                  </span>
                </div>
                
                {/* Results Bar */}
                <div className="flex h-8 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 flex items-center justify-center text-white"
                    style={{ width: `${vote.options[0]?.votePercentage || 0}%` }}
                  >
                    {vote.options[0]?.votePercentage}%
                  </div>
                  <div
                    className="bg-blue-500 flex items-center justify-center text-white"
                    style={{ width: `${vote.options[1]?.votePercentage || 0}%` }}
                  >
                    {vote.options[1]?.votePercentage}%
                  </div>
                </div>
                
                {/* Vote Counts */}
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{vote.options[0]?.voteCount || 0} votes</span>
                  <span>{vote.options[1]?.voteCount || 0} votes</span>
                </div>

                {/* Voting Period */}
                <div className="text-center mt-4 text-gray-500 text-sm">
                  투표 기간: {new Date(vote.createdAt).toLocaleDateString()} ~ {new Date(vote.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">종료된 투표가 없습니다.</div>
      )}
      <div className="flex justify-center pb-10">
        <Pagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={votes.length}
          pageRangeDisplayed={5}
          prevPageText={"이전"}
          nextPageText={"다음"}
          onChange={changePageHandler}
          innerClass="flex gap-2"
          itemClass="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
          activeClass="bg-cusBlack-light !text-white"
          linkClass="block w-full h-full text-center"
        />
      </div>
    </div>
  );
};

export default VoteClosedPage;
