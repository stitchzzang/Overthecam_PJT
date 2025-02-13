import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams } from "react-router-dom";

function MyPageVote() {
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
    <div className="bg-[#EEF6FF] rounded-lg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {!id && (
            <div className="flex justify-end mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showMyVotesOnly}
                  onChange={(e) => setShowMyVotesOnly(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">내가 만든 투표만 보기</span>
              </label>
            </div>
          )}

          {votes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              투표 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {votes.map((vote) => (
                <div key={vote.voteId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{vote.title}</h3>
                      <p className="text-sm text-gray-600">{vote.content}</p>
                      <p className="text-sm text-gray-500">작성자: {vote.creatorNickname}</p>
                    </div>
                    {String(vote.creatorUserId) === currentUserId && (
                      <button
                        onClick={() => handleDeleteVote(vote.voteId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {vote.options.map((option) => (
                      <div key={option.optionId} className="relative">
                        <div 
                          className={`h-8 rounded-md ${
                            option.selected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                          style={{ width: `${option.votePercentage}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-sm">{option.optionTitle}</span>
                            <span className="text-sm">{option.votePercentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    총 투표수: {vote.totalVoteCount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pageInfo.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold ${
                  currentPage === page
                    ? "bg-[#A5C5F4] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPageVote;
