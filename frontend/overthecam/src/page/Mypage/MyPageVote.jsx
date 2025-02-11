import { useState, useEffect } from "react";
import NavBar from "../../components/Layout/NavBar";
import useAuthStore from "../../store/User/UserStore";
import { authAxios } from "../../common/axiosinstance";

function MyPageVote() {
  const [votes, setVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyVotesOnly, setShowMyVotesOnly] = useState(false);

  // 투표 데이터 가져오기
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAxios.get('/votes/history', {
          params: {
            myVotesOnly: showMyVotesOnly
          }
        });
        setVotes(response.data);
      } catch (err) {
        setError('투표 기록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch votes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, [showMyVotesOnly]); // showMyVotesOnly가 변경될 때마다 데이터 다시 불러오기

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
      {/* Vote Management Section */}
      <div className="bg-white rounded-2xl p-8 clay">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">투표 관리</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">내 투표만 보기</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showMyVotesOnly}
                onChange={(e) => setShowMyVotesOnly(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          {votes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              투표 기록이 없습니다.
            </div>
          ) : (
            votes.map((vote) => (
              <div key={vote.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{vote.title}</h3>
                  <span className={`px-3 py-1 ${
                    vote.status === "삭제" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  } rounded-md text-sm`}>
                    {vote.status}
                  </span>
                </div>
                <div className="space-y-3">
                  {vote.options.map((option, index) => (
                    <div key={index} className="relative h-8">
                      <div 
                        className={`absolute inset-0 ${option.color} rounded-md transition-all duration-300`} 
                        style={{ width: `${option.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-sm font-medium">{option.name}</span>
                        <span className="text-sm font-medium">{option.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPageVote;
