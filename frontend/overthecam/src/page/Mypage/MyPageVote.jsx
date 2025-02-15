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

  const renderVoteResult = (vote) => {
    const totalVotes = vote.options.reduce((sum, option) => sum + option.voteCount, 0);
    
    const mySelectedOption = vote.options.find(option => option.selected);
    const winningOption = vote.options.reduce((prev, current) => 
      (current.voteCount > prev.voteCount) ? current : 
      (current.voteCount === prev.voteCount) ? current : prev
    );
    
    const selectedFirst = mySelectedOption?.optionId === vote.options[0].optionId;
    const selectedSecond = mySelectedOption?.optionId === vote.options[1].optionId;
    const didIWin = mySelectedOption?.optionId === winningOption.optionId;

    const getFirstBarColor = () => {
      if (selectedFirst) {
        return 'bg-cusRed';  
      }
      return 'bg-cusGray';  
    };

    const getSecondBarColor = () => {
      if (selectedSecond) {
        return 'bg-cusBlue'; 
      }
      return 'bg-cusGray'; 
    };

    const firstPercentage = totalVotes > 0 ? Math.round(vote.options[0].votePercentage * 10) / 10 : 0;
    const secondPercentage = totalVotes > 0 ? Math.round(vote.options[1].votePercentage * 10) / 10 : 0;

    return (
      <div className="mb-4">
        {vote.options && vote.options.length >= 2 && (
          <>
            <div className="mb-2 flex justify-between">
              <span className={`font-medium ${selectedFirst ? 'text-cusRed' : 'text-cusBlack-light'}`}>
                {vote.options[0].optionTitle}
              </span>
            </div>
            <div className="relative h-12 clay bg-gray-200 rounded-lg overflow-hidden">
              <div
                className={`h-full clay ${getFirstBarColor()} flex items-center justify-start pl-2 text-white`}
                style={{ width: `${firstPercentage}%` }}
              >
                {firstPercentage}%
              </div>
            </div>

            <div className="mt-4 mb-2 flex justify-between">
              <span className={`font-medium ${selectedSecond ? 'text-cusBlue' : 'text-cusBlack-light'}`}>
                {vote.options[1].optionTitle}
              </span>
            </div>
            <div className="relative h-12 clay bg-gray-200 rounded-lg overflow-hidden">
              <div
                className={`h-full clay ${getSecondBarColor()} flex items-center justify-start pl-2 text-white`}
                style={{ width: `${secondPercentage}%` }}
              >
                {secondPercentage}%
              </div>
            </div>

            <div className="text-right text-sm text-gray-600 mt-2">
              총 투표수: {totalVotes}
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center">로딩 중...</div></div>;
  if (error) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center text-red-500">{error}</div></div>;

  return (
    <div className="space-y-6">
      {votes.map((vote) => (
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
            {renderVoteResult(vote)}
          </div>
        </div>
      ))}

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
