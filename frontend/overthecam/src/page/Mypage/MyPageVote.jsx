import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from 'react-js-pagination';
import VoteDetailModal from './Modal/VoteList';
import Swal from 'sweetalert2';

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
  const [selectedVote, setSelectedVote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const fetchVoteHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 쿼리 파라미터 구성
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage - 1);
        if (userId) {
          queryParams.append('userId', userId);
        }
        
        const response = await authAxios.get(
          `/mypage/vote/history?${queryParams.toString()}`
        );
        
        if (response && response.success) {
          setVotes(response.data.content);
          if (response.data.pageInfo) {
            setPageInfo({
              totalPages: response.data.pageInfo.totalPages,
              totalElements: response.data.pageInfo.totalElements,
              pageSize: response.data.pageInfo.pageSize
            });
          }
        }
      } catch (err) {
        console.error('Error fetching votes:', err);
        setError('투표 기록을 불러오는데 실패했습니다.');
        setVotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoteHistory();
  }, [currentPage, userId]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeleteVote = async (voteId) => {
    try {
      const result = await Swal.fire({
        title: '투표를 삭제하시겠습니까?',
        text: "삭제된 투표는 복구할 수 없습니다.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        const response = await authAxios.delete(`/vote/${voteId}`);
        
        // response.data.success가 true이므로 성공 처리를 해야 합니다
        // 성공 알림
        await Swal.fire({
          title: '삭제되었습니다!',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        // 목록 업데이트
        setVotes(prevVotes => prevVotes.filter(vote => vote.voteId !== voteId));
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      await Swal.fire({
        title: '삭제 실패',
        text: '투표 삭제에 실패했습니다.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const renderVoteResult = (voteOptions) => {
    if (!voteOptions || voteOptions.length === 0) {
      return null;
    }

    const totalVotes = voteOptions.reduce((sum, option) => sum + option.voteCount, 0);
    
    return voteOptions.map((option, index) => {
      const percentage = totalVotes === 0 ? 0 : ((option.voteCount / totalVotes) * 100).toFixed(1);
      const isFirstOption = index === 0;
      
      return (
        <div key={index} className="mb-4">
          <div className="flex justify-between mb-2">
            <span className={`font-bold text-lg ${isFirstOption ? 'text-red-400' : 'text-blue-400'}`}>
              {option.optionTitle}
            </span>
            <span className={`font-bold ${isFirstOption ? 'text-red-400' : 'text-blue-400'}`}>
              {option.voteCount}표 ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
            <div
              className={`${isFirstOption ? 'bg-red-400' : 'bg-blue-400'} h-4 rounded-full transition-all duration-300`}
              style={{ 
                width: `${percentage}%`,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {percentage > 0 && (
                <div className="absolute top-0 right-0 h-full w-2 bg-white opacity-30 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // 투표 상세 정보 조회
  const handleVoteClick = async (voteId) => {
    try {
      console.log('투표 클릭됨:', voteId); // 클릭 확인용 로그
      setIsDetailLoading(true);
      const response = await authAxios.get(`/mypage/vote/${voteId}/detail`);
      console.log('API 응답:', response); // API 응답 확인용 로그
      
      if (response.success) {
        setSelectedVote(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('투표 상세 정보 로딩 실패:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (isLoading) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center">로딩 중...</div></div>;
  if (error) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center text-red-500">{error}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-2 mb-4">
        <span className="text-gray-600 font-medium">내가 만든 투표만 보기</span>
        <button
          onClick={() => setShowMyVotesOnly(!showMyVotesOnly)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showMyVotesOnly ? 'bg-cusBlue' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showMyVotesOnly ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

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
        <div className="space-y-6">
          {votes
            .filter(vote => !showMyVotesOnly || vote.creatorUserId === currentUserId)
            .map((vote) => (
              <div 
                key={vote.voteId} 
                className="bg-white rounded-lg p-6 clay hover:shadow-lg transition-all duration-300 opacity-100 transform scale-100"
                style={{
                  animation: 'fadeIn 0.3s ease-in-out'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 w-full">
                      <h3 
                        className="text-2xl font-bold cursor-pointer text-cusBlack hover:text-cusBlue transition-colors tracking-tight text-center w-full"
                        onClick={() => handleVoteClick(vote.voteId)}
                      >
                        {vote.title}
                      </h3>
                    </div>
                    <p className="text-lg text-gray-600 mt-2 leading-relaxed font-medium text-center">
                      {vote.content}
                    </p>
                  </div>
                  {vote.creatorUserId === currentUserId && (
                    <button
                      onClick={() => handleDeleteVote(vote.voteId)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4 font-semibold flex items-center gap-1 shrink-0"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" 
                        />
                      </svg>
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 mt-4">
                  {renderVoteResult(vote.options)}
                </div>
              </div>
            ))}
        </div>
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

      {/* 투표 상세 모달 */}
      {showDetailModal && selectedVote && (
        <VoteDetailModal
          voteData={selectedVote}
          isLoading={isDetailLoading}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVote(null);
          }}
        />
      )}

      {/* CSS 애니메이션 부분 수정 */}
      <style type="text/css">
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default MyPageVote;
