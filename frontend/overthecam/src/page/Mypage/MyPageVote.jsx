import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams, useNavigate } from "react-router-dom";

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
            {vote.options.map((option) => (
              <div key={option.optionId} className="relative">
                {!isOtherProfile ? (
                  <div className="relative">
                    <div 
                      className={`h-12 rounded-lg flex items-center px-4 relative ${
                        option.selected 
                          ? 'bg-cusLightBlue-lighter clay' 
                          : 'bg-gray-50 clay'
                      }`}
                    >
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-lg ${
                          option.selected 
                            ? 'bg-cusLightBlue-light' 
                            : 'bg-gray-200'
                        }`}
                        style={{ width: `${option.votePercentage}%`, opacity: '0.5' }}
                      />
                      <div className="flex justify-between items-center w-full relative z-10">
                        <span className="font-semibold text-cusBlack tracking-tight">{option.optionTitle}</span>
                        <span className={`font-bold ${option.selected ? 'text-cusBlue' : 'text-gray-600'}`}>
                          {option.votePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-12 rounded-lg bg-gray-50 clay flex items-center px-4 relative">
                      <div 
                        className="absolute left-0 top-0 h-full bg-cusBlue"
                        style={{ 
                          width: `${option.votePercentage}%`, 
                          opacity: '0.2',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <div className="flex justify-between items-center w-full relative z-10">
                        <span className="font-semibold text-cusBlack tracking-tight">
                          {option.optionTitle}
                        </span>
                        <span className="text-cusBlue font-bold">
                          {option.votePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {pageInfo.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                currentPage === page
                  ? "bg-cusBlue text-white clay"
                  : "bg-white text-cusGray-dark hover:bg-cusLightBlue-lighter clay"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPageVote;
