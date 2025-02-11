import { useState, useEffect } from "react";
import { authAxios } from "../../common/axiosinstance";

function MyPageBattle() {
  const [battles, setBattles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 배틀 히스토리 데이터 가져오기
  useEffect(() => {
    const fetchBattleHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAxios.get('/battles/history');
        setBattles(response.data);
      } catch (err) {
        setError('배틀 기록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch battle history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#EEF6FF] rounded-lg p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EEF6FF] rounded-lg p-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#EEF6FF] rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">배틀 관리</h2>
      <div className="max-w-4xl mx-auto">
        {/* Battle History Table */}
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
                  {battles.map((battle) => (
                    <tr key={battle.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-800">
                        {new Date(battle.date).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-800">{battle.title}</td>
                      <td className="py-4 px-4 text-gray-800">{battle.choice}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`${
                          battle.result === '승' ? 'text-green-600' : 
                          battle.result === '패' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {battle.result} ({battle.pointChange > 0 ? '+' : ''}{battle.pointChange})
                        </span>
                      </td>
                    </tr>
                  ))}
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