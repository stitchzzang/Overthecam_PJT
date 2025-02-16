import React, { useEffect, useState } from 'react';
import { authAxios } from '../../../common/axiosinstance';

const BattleList = ({ isOpen, onClose, battleId }) => {
  const [battleDetail, setBattleDetail] = useState(null);
  
  useEffect(() => {
    const fetchBattleDetail = async () => {
      if (!isOpen || !battleId) return;
      
      try {
        console.log('Fetching battle detail for ID:', battleId);
        const response = await authAxios.get(`/mypage/battle/${battleId}/detail`);
        console.log('Battle detail response:', response);
        
        if (response && response.success) {
          setBattleDetail(response.data);
        }
      } catch (error) {
        console.error('배틀 상세 조회 실패:', error.response?.data);
        if (error.response?.data?.error?.message) {
          alert(error.response.data.error.message);
        }
      }
    };

    fetchBattleDetail();
  }, [isOpen, battleId]);

  if (!isOpen || !battleDetail) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{battleDetail.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 배틀 정보 */}
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>진행 시간</span>
            <span>{battleDetail.totalTime}초</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>방장</span>
            <span>{battleDetail.hostNickname}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>참가자</span>
            <span>{battleDetail.participants.join(', ')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>내가 선택한 답변</span>
            <span>{battleDetail.selectedOption}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>획득 점수</span>
            <span>{battleDetail.earnedScore} 점</span>
          </div>
        </div>

        {/* 투표 결과 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">투표 결과</h3>
          <div className="space-y-4">
            {battleDetail.voteStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{stat.optionTitle}</span>
                  <span className={`${stat.isWinner ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {stat.voteCount}표 ({stat.votePercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      stat.isWinner ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                    style={{ width: `${stat.votePercentage}%` }}
                  ></div>
                </div>
                {stat.optionTitle === battleDetail.selectedOption && (
                  <div className="mt-2 text-blue-600 text-sm">
                    ✓ 내가 선택한 답변
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 승패 결과 */}
        <div className="mt-6 text-center">
          <span className={`text-xl font-bold ${battleDetail.winner ? 'text-blue-600' : 'text-red-600'}`}>
            {battleDetail.winner ? '승리!' : '패배...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattleList;
