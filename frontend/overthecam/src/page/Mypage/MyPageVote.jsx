import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from 'react-js-pagination';

function MyPageVote({ userId, isOtherProfile }) {
  const [votes, setVotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalElements: 0,
    pageSize: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyVotesOnly, setShowMyVotesOnly] = useState(false);
  const { id } = useParams();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo.userId;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 내가 만든 투표 또는 내가 투표한 투표만 보기
        let url = `/mypage/vote/history?page=${currentPage - 1}`;
        
        // 현재 로그인한 사용자의 ID로 필터링
        url += `&userId=${currentUserId}`;  // 내가 투표한 것들
        
        if (showMyVotesOnly) {
          url += '&createdByMe=true';  // 내가 만든 것들
        }

        const response = await authAxios.get(url);
        
        if (response.data) {
          // 받아온 투표 중에서 내가 만들었거나 투표한 것만 필터링
          const filteredVotes = response.data.content.filter(vote => 
            vote.creatorUserId === currentUserId ||  // 내가 만든 투표
            vote.options.some(option => option.selected)  // 내가 투표한 투표
          );
          
          setVotes(filteredVotes);
          setPageInfo(response.data.pageInfo);
        }
      } catch (err) {
        setError('투표 기록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch votes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, [id, currentPage, showMyVotesOnly, currentUserId]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeleteVote = async (voteId) => {
    try {
      await authAxios.delete(`/votes/${voteId}`);
      // 삭제 후 목록 새로고침
      const newVotes = votes.filter(vote => vote.voteId !== voteId);
      setVotes(newVotes);
    } catch (error) {
      console.error('Failed to delete vote:', error);
      alert('투표 삭제에 실패했습니다.');
    }
  };

  const renderVoteResult = (voteOptions) => {
    if (!voteOptions || voteOptions.length === 0) {
      return null;  // 옵션이 없을 경우 처리
    }

    // 총 투표수 계산 (초기값 0 추가)
    const totalVotes = voteOptions.reduce((sum, option) => sum + option.voteCount, 0);
    
    return voteOptions.map((option, index) => {
      const percentage = totalVotes === 0 ? 0 : ((option.voteCount / totalVotes) * 100).toFixed(1);
      
      return (
        <div key={index} className="mb-4">
          <div className="flex justify-between mb-1">
            <span>{option.optionTitle}</span>
            <span>{option.voteCount}표 ({percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      );
    });
  };

  if (isLoading) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center">로딩 중...</div></div>;
  if (error) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center text-red-500">{error}</div></div>;

  return (
    <div className="space-y-6">
      {votes.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 bg-white rounded-lg p-8">
          <div className="text-center text-gray-500 text-lg">
            아직 참여한 투표가 없습니다.
          </div>
          <div className="text-center text-cusBlue font-medium">
            투표를 만들어보세요!
          </div>
          <button
            onClick={() => navigate('/main/create-vote')}
            className="bg-cusBlue hover:bg-cusBlue-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 4.5v15m7.5-7.5h-15" 
              />
            </svg>
            투표 만들기
          </button>
        </div>
      ) : (
        votes.map((vote) => (
          <div key={vote.voteId} className="bg-white rounded-lg p-6 clay hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 
                    className="text-2xl font-bold cursor-pointer text-cusBlack hover:text-cusBlue transition-colors tracking-tight text-center"
                    onClick={() => navigate(`/main/vote-detail/${vote.voteId}`)}
                  >
                    {vote.title}
                  </h3>
                  {vote.battleId && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-7 h-7 text-red-500"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" 
                      />
                    </svg>
                  )}
                </div>
                <p className="text-lg text-gray-600 mt-2 leading-relaxed font-medium text-center">
                  {vote.content}
                </p>
              </div>
              {!isOtherProfile && String(vote.creatorUserId) === currentUserId && (
                <button
                  onClick={() => handleDeleteVote(vote.voteId)}
                  className="text-cusRed hover:text-cusRed-dark transition-colors ml-4 font-semibold"
                >
                  삭제
                </button>
              )}
            </div>
            
            <div className="space-y-3 mt-4">
              {renderVoteResult(vote.options)}
            </div>
          </div>
        ))
      )}

      {pageInfo.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            activePage={currentPage}
            itemsCountPerPage={pageInfo.pageSize}
            totalItemsCount={pageInfo.totalElements}
            pageRangeDisplayed={5}
            prevPageText={"이전"}
            nextPageText={"다음"}
            onChange={handlePageChange}
            innerClass="flex gap-2"
            itemClass="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
            activeClass="bg-cusBlack-light !text-white"
            linkClass="block w-full h-full text-center"
          />
        </div>
      )}
    </div>
  );
}

export default MyPageVote;
