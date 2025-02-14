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
      (current.voteCount === prev.voteCount) ? current : prev  // 동점일 때도 현재 옵션을 선택
    );
    
    const selectedFirst = mySelectedOption?.optionId === vote.options[0].optionId;
    const selectedSecond = mySelectedOption?.optionId === vote.options[1].optionId;
    const didIWin = mySelectedOption?.optionId === winningOption.optionId;

    const getLeftBarColor = () => {
      if (selectedFirst) {
        return 'bg-red-500';  // 1번 선택시 항상 빨간색
      }
      return 'bg-gray-300';  // 미선택시 연한 회색
    };

    const getRightBarColor = () => {
      if (selectedSecond) {
        return 'bg-blue-500';  // 2번 선택시 항상 파란색
      }
      return 'bg-gray-300';  // 미선택시 연한 회색
    };

    const leftPercentage = totalVotes > 0 ? Math.round(vote.options[0].votePercentage * 10) / 10 : 0;
    const rightPercentage = totalVotes > 0 ? Math.round(vote.options[1].votePercentage * 10) / 10 : 0;

    return (
      <div className="mb-4">
        {vote.options && vote.options.length >= 2 && (
          <>
            <div className="mb-2 flex justify-between">
              <span className={`font-medium ${selectedFirst ? 'text-red-500' : 'text-gray-600'}`}>
                {vote.options[0].optionTitle}
              </span>
              <span className={`font-medium ${selectedSecond ? 'text-blue-500' : 'text-gray-600'}`}>
                {vote.options[1].optionTitle}
              </span>
            </div>
            <div className="relative h-12 clay bg-gray-200 rounded-lg overflow-hidden flex">
              {leftPercentage > 0 && (
                <div
                  className={`h-full clay ${getLeftBarColor()} flex items-center justify-start pl-2 text-white`}
                  style={{ width: `${leftPercentage}%` }}
                >
                  {leftPercentage}%
                </div>
              )}
              {rightPercentage > 0 && (
                <div
                  className={`h-full clay ${getRightBarColor()} flex items-center justify-end pr-2 text-white`}
                  style={{ width: `${rightPercentage}%` }}
                >
                  {rightPercentage}%
                </div>
              )}
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
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 
                className="text-xl font-bold mb-3 cursor-pointer text-cusBlack hover:text-cusBlue transition-colors tracking-tight"
                onClick={() => navigate(`/main/vote-detail/${vote.voteId}`)}
              >
                {vote.title}
              </h3>
              <p className="text-gray-600 mb-2 leading-relaxed font-medium">{vote.content}</p>
              <div className="flex items-center text-base text-cusBlack font-medium">
                <span className="mr-2">작성자: {vote.creatorNickname}</span>
                <span className="text-cusGray-dark mx-2">•</span>
                <span className="ml-2">총 투표수: {vote.totalVoteCount}</span>
              </div>
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
          
          <div className="space-y-3">
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
