import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from 'react-js-pagination';
import BattleList from './Modal/BattleList';

function MyPageBattle({ userId }) {
  const [battles, setBattles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalElements: 0,
    pageSize: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);

  useEffect(() => {
    const fetchBattleHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage - 1);
        if (userId) {
          queryParams.append('userId', userId);
        }
        
        const response = await authAxios.get(
          `/mypage/battle/history?${queryParams.toString()}`
        );
        
        if (response && response.success) {
          setBattles(response.data.content);
          if (response.data.pageInfo) {
            setPageInfo({
              totalPages: response.data.pageInfo.totalPages,
              totalElements: response.data.pageInfo.totalElements,
              pageSize: response.data.pageInfo.pageSize
            });
          }
        }
      } catch (err) {
        console.error('Error fetching battles:', err);
        setError('배틀 기록을 불러오는데 실패했습니다.');
        setBattles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleHistory();
  }, [currentPage, userId]);

  // 디버깅을 위한 추가 useEffect
  useEffect(() => {
    console.log('Current battles state:', battles);
    console.log('Current loading state:', isLoading);
    console.log('Current error state:', error);
  }, [battles, isLoading, error]);

  // battles 상태가 변경될 때마다 로그
  useEffect(() => {
    console.log('battles state가 변경됨:', battles);
  }, [battles]);

  // 승패 결과 텍스트 및 스타일 결정 함수
  const getBattleResult = (battle) => {
    const isBattler = battle.role === 'BATTLER' || 
                      battle.role === 'HOST_BATTLER' || 
                      battle.role === 'PARTICIPANT_BATTLER';

    if (battle.winner) {
      return {
        text: '승',
        style: 'text-green-600'
      };
    }

    // 배틀러인 경우
    if (isBattler) {
      if (!battle.winner && battle.earnedScore > 0) {
        // 무승부인 경우 (배틀러)
        return {
          text: '무',
          style: 'text-gray-600'
        };
      } else {
        // 패배인 경우 (배틀러)
        return {
          text: '패',
          style: 'text-red-600'
        };
      }
    }
    
    // 일반 참가자인 경우
    if (!battle.winner && battle.earnedScore === 0) {
      // 무승부인 경우 (일반 참가자)
      return {
        text: '무',
        style: 'text-gray-600'
      };
    } else {
      // 패배인 경우 (일반 참가자)
      return {
        text: '패',
        style: 'text-red-600'
      };
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleTitleClick = (battle) => {
    setIsModalOpen(true);
    setSelectedBattle(battle.battleId);
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">배틀 관리</h2>
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center">로딩 중...</div>
        ) : battles.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center text-gray-500 text-lg">
              아직 참여한 배틀이 없습니다.
            </div>
            <div className="text-center text-cusBlue font-medium">
              배틀에 참여해보세요!
            </div>
            <button
              onClick={() => navigate('/main/create-battle-room')}
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
              배틀방 만들기
            </button>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-4 font-semibold text-gray-600 w-[20%] text-center">날짜</th>
                    <th className="py-4 px-4 font-semibold text-gray-600 w-[35%] text-center">방송 제목</th>
                    <th className="py-4 px-4 font-semibold text-gray-600 w-[35%] text-center">선택지</th>
                    <th className="py-4 px-4 font-semibold text-gray-600 w-[10%] text-center">승패</th>
                  </tr>
                </thead>
                <tbody>
                  {battles.map((battle) => {
                    const result = getBattleResult(battle);
                    return (
                      <tr key={battle.battleId} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-gray-800 text-center whitespace-nowrap">
                          {new Date(battle.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-800 text-center">
                          <button 
                            onClick={() => handleTitleClick(battle)}
                            className="hover:text-blue-500 cursor-pointer"
                          >
                            {battle.title}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-gray-800 text-center">
                          {battle.optionTitle}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`${result.style} whitespace-nowrap`}>
                            {result.text} ({battle.earnedScore >= 0 ? '+' : ''}{battle.earnedScore})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

      <BattleList 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        battleId={selectedBattle}
      />
    </div>
  );
}

export default MyPageBattle;
