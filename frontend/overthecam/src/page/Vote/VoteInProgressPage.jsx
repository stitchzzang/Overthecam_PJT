import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';
import Pagination from 'react-js-pagination';

const VoteInProgressPage = () => {
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
        const response = await publicAxios.get('/vote/list', {  // Updated API endpoint
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('API Response:', response.data);
        if (response.data && response.data.content) {
          setVotes(response.data.content);
          setError(null);
        } else {
          setError('투표 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Fetch error details:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
        } else if (err.response) {
          // Server responded with error status
          if (err.response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login', { state: { from: '/vote' } });
          } else {
            setError(`Error ${err.response.status}: ${err.response.data.message || '투표 목록을 불러오는데 실패했습니다.'}`);
          }
        } else {
          setError('예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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

  const handleVote = async (voteId, optionId) => {
    try {
      console.log('Submitting vote with data:', { voteId, optionId });
      await publicAxios.post(`/vote/${voteId}/vote/${optionId}`, {}, {  // Updated API endpoint
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Vote submitted:', { voteId, optionId });
      const response = await publicAxios.get('/vote/list', {  // Updated API endpoint
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data && response.data.content) {
        setVotes(response.data.content);
        const indexOfLastItem = page * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        setCurrentList(response.data.content.slice(indexOfFirstItem, indexOfLastItem));
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        alert('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
        return;
      }
      
      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 401:
            navigate('/login', { state: { from: '/vote' } });
            break;
          case 400:
            console.error('Invalid input data:', err.response.data);
            alert(err.response.data.message || '잘못된 입력값입니다.');
            break;
          case 404:
            console.error('Resource not found:', err.response.data);
            alert(err.response.data.message || '투표를 찾을 수 없습니다.');
            break;
          default:
            console.error('Vote error:', err.response.data);
            alert(err.response.data.message || '투표하는 도중 오류가 발생했습니다.');
        }
      } else {
        alert('예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error('Vote error:', err);
    }
  };

  const changePageHandler = (page) => {
    setPage(page);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      {currentList.length > 0 ? (
        currentList.map(vote => (
          <div key={vote.id} className="mb-4">
            <h3 className="text-xl font-bold mb-4 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/vote-detail/${vote.id}`)}>
              {vote.title}
            </h3>
            {vote.content && <p>{vote.content}</p>}
            <div className="flex gap-4 mb-4">
              <button onClick={() => handleVote(vote.id, vote.option1Id)} className="flex-1">
                {vote.option1}
              </button>
              <button onClick={() => handleVote(vote.id, vote.option2Id)} className="flex-1">
                {vote.option2}
              </button>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{vote.option1}: {vote.option1Votes}%</span>
              <span>{vote.option2}: {vote.option2Votes}%</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">현재 진행중인 투표가 없습니다.</div>
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

export default VoteInProgressPage;