import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';
import Pagination from 'react-js-pagination';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

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
        <button
          key="prev"
          onClick={() => onChange(activePage - 1)}
          className="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
        >
          이전
        </button>
      )}
      {pages}
      {activePage < totalPages && (
        <button
          key="next"
          onClick={() => onChange(activePage + 1)}
          className="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
        >
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
  const [selectedVote, setSelectedVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
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
        
        if (response.data && response.data.content) {
          // 데이터 구조 매핑 수정
          const mappedVotes = response.data.content.map(vote => ({
            id: vote.voteId, // voteId를 id로 매핑
            title: vote.title,
            content: vote.content,
            option1: vote.option1,
            option2: vote.option2,
            option1Id: vote.optionId1,
            option2Id: vote.optionId2,
            option1Votes: vote.option1Percentage,
            option2Votes: vote.option2Percentage,
            totalVotes: vote.totalVotes
          }));
          
          setVotes(mappedVotes);
          setError(null);
        } else {
          setError('투표 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Fetch error details:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
        } else if (err.response) {
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
    console.log('Votes updated:', votes); // votes 상태 업데이트 확인
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const slicedList = votes.slice(indexOfFirstItem, indexOfLastItem);
    console.log('Sliced list:', slicedList); // 잘린 목록 확인
    setCurrentList(slicedList);
  }, [page, votes]);

  const handleVote = async (voteId, optionId) => {
    if (isVoting) return;
    
    console.log('Vote attempt with:', { voteId, optionId });
    
    if (!voteId || !optionId) {
      console.error('Required IDs missing:', { voteId, optionId });
      return;
    }
    
    setIsVoting(true);
    try {
      const voteResponse = await publicAxios.post(
        `/vote/${voteId}/vote/${optionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      if (voteResponse.status === 200) {
        const listResponse = await publicAxios.get('/vote/list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (listResponse.data && listResponse.data.content) {
          // 응답 데이터 매핑 추가
          const mappedVotes = listResponse.data.content.map(vote => ({
            id: vote.voteId,
            title: vote.title,
            content: vote.content,
            option1: vote.option1,
            option2: vote.option2,
            option1Id: vote.optionId1,
            option2Id: vote.optionId2,
            option1Votes: vote.option1Percentage,
            option2Votes: vote.option2Percentage,
            totalVotes: vote.totalVotes
          }));
          
          setVotes(mappedVotes);
          updateCurrentList(mappedVotes, page);
          setSelectedVote(mappedVotes.find(vote => vote.id === voteId));
          alert('투표가 성공적으로 등록되었습니다.');
        }
      }
    } catch (err) {
      console.error('Vote error details:', err);
      
      if (err.message === '투표 정보가 올바르지 않습니다.' || err.message === '잘못된 투표 정보입니다.') {
        alert(err.message);
        return;
      }

      if (!navigator.onLine) {
        alert('인터넷 연결을 확인해주세요.');
        return;
      }

      if (err.response) {
        switch (err.response.status) {
          case 400:
            alert('잘못된 요청입니다. 입력값을 확인해주세요.');
            break;
          case 401:
            alert('로그인이 필요합니다.');
            navigate('/login', { state: { from: '/vote' } });
            break;
          case 403:
            alert('투표 권한이 없습니다.');
            break;
          case 404:
            alert('존재하지 않는 투표입니다.');
            break;
          case 500:
            alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            break;
          default:
            alert('투표 처리 중 오류가 발생했습니다.');
        }
      } else {
        alert('투표 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  // 현재 페이지 목록 업데이트 헬퍼 함수
  const updateCurrentList = (votes, currentPage) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentList(votes.slice(indexOfFirstItem, indexOfLastItem));
  };

  const changePageHandler = (page) => {
    setPage(page);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      {currentList.length > 0 ? (
        currentList.map((vote, index) => (
          <div key={vote.id || index} className="mb-4">
            <h3 
              className="text-xl font-bold mb-4 cursor-pointer hover:text-blue-600" 
              onClick={() => {
                console.log('Navigating to vote detail:', `/vote-detail/${vote.id}`);
                navigate(`/vote-detail/${vote.id}`);
              }}
            >
              {vote.title}
            </h3>
            {vote.content && <p>{vote.content}</p>}
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => {
                  const optionId = vote.option1Id || vote.optionId1;
                  console.log('Vote data:', {
                    voteId: vote.id,
                    optionId,
                    vote
                  });
                  if (vote.id && optionId) {
                    handleVote(vote.id, optionId);
                  }
                }} 
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={isVoting}
              >
                {vote.option1}
              </button>
              <button 
                onClick={() => {
                  const optionId = vote.option2Id || vote.optionId2;
                  console.log('Vote data:', {
                    voteId: vote.id,
                    optionId,
                    vote
                  });
                  if (vote.id && optionId) {
                    handleVote(vote.id, optionId);
                  }
                }} 
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={isVoting}
              >
                {vote.option2}
              </button>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{vote.option1}: {vote.option1Votes}%</span>
              <span>{vote.option2}: {vote.option2Votes}%</span>
              <span>참여자 수: {vote.totalVotes}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">현재 진행중인 투표가 없습니다.</div>
      )}
      {selectedVote && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">투표 결과</h3>
          <Bar
            data={{
              labels: [selectedVote.option1, selectedVote.option2],
              datasets: [
                {
                  label: '투표 수',
                  data: [selectedVote.option1Votes, selectedVote.option2Votes],
                  backgroundColor: ['#36A2EB', '#FF6384'],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      )}
      <div className="flex justify-center pb-10">
        <CustomPagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={votes.length}
          onChange={changePageHandler}
        />
      </div>
    </div>
  );
};

export default VoteInProgressPage;