import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";
import { useParams } from "react-router-dom";

function MyPageBattle() {
  const [battles, setBattles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();  // URL에서 userId를 가져옴

  useEffect(() => {
    const fetchBattleHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = id ? `/mypage/battle/history?userId=${id}` : '/mypage/battle/history';
        console.log('요청 URL:', url);  // 디버깅용
        
        const response = await authAxios.get(url);
        console.log('응답:', response);  // 디버깅용
        
        if (response.success && response.data) {
          setBattles(response.data);
        }
      } catch (err) {
        setError('배틀 기록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch battle history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleHistory();
  }, [id]);

  // 승패 결과 텍스트 및 스타일 결정 함수
  const getBattleResult = (battle) => {
    if (battle.winner) {
      return {
        text: '승',
        style: 'text-green-600'
      };
    } else if (!battle.winner && battle.earnedScore === 0) {
      return {
        text: '무',
        style: 'text-gray-600'
      };
    } else {
      return {
        text: '패',
        style: 'text-red-600'
      };
    }
  };

  if (isLoading) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center">로딩 중...</div></div>;
  if (error) return <div className="bg-[#EEF6FF] rounded-lg p-8"><div className="text-center text-red-500">{error}</div></div>;

  return (
    <div className="bg-[#EEF6FF] rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">배틀 관리</h2>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="overflow-x-auto">
            {battles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                아직 참여한 배틀이 없습니다.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">날짜</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">방송 제목</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">선택지</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">승패여부</th>
                  </tr>
                </thead>
                <tbody>
                  {battles.map((battle) => {
                    const result = getBattleResult(battle);
                    return (
                      <tr key={battle.battleId} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-gray-800">
                          {new Date(battle.date).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-800">{battle.title}</td>
                        <td className="py-4 px-4 text-gray-800">{battle.optionTitle}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={result.style}>
                            {result.text} ({battle.earnedScore >= 0 ? '+' : ''}{battle.earnedScore})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPageBattle;