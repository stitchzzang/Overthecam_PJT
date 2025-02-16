import React, { useEffect, useState } from 'react';
import { authAxios } from '../../../common/axiosinstance';

const BattleList = ({ isOpen, onClose, battleId, battleDate }) => {
  const [battleDetail, setBattleDetail] = useState(null);
  
  useEffect(() => {
    const fetchBattleDetail = async () => {
      if (!isOpen || !battleId) return;
      
      try {
        const response = await authAxios.get(`/mypage/battle/${battleId}/detail`);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !battleDetail) return null;

  return (
    <dialog className="modal fixed inset-0 z-50 flex items-center justify-center rounded-[2rem]" open>
      <div className="bg-white w-full max-w-[180rem] relative shadow-2xl rounded-[2rem]" 
           style={{ margin: '0', padding: '6rem', minHeight: '44rem' }}>
        {/* 상단 제목 영역 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Battle Detail</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600 text-lg">
            <span>📅 {battleDate}</span>
            <span>|</span>
            <span>👑 {battleDetail?.hostNickname}</span>
          </div>
        </div>

        {/* 배틀 결과 그래프 영역 - 파란 테두리 추가 */}
        <div className="bg-white p-8 mb-6 border-4 border-blue-400 rounded-[1.5rem]">
          <div className="text-2xl font-bold text-center mb-6">
            {battleDetail.title}
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-red-500 text-xl font-bold">A. {battleDetail.voteStats[0].optionTitle}</span>
            <span className="text-gray-500 text-xl font-bold">B. {battleDetail.voteStats[1].optionTitle}</span>
          </div>
          <div className="h-14 bg-gray-200 rounded-[2rem] overflow-hidden flex">
            <div 
              className="bg-red-400 transition-all duration-300 flex items-center justify-end pr-4"
              style={{ width: `${battleDetail.voteStats[0].votePercentage}%` }}
            >
              <span className="text-white font-bold">{battleDetail.voteStats[0].votePercentage}%</span>
            </div>
            <div 
              className="bg-gray-400 transition-all duration-300 flex items-center justify-start pl-4"
              style={{ width: `${battleDetail.voteStats[1].votePercentage}%` }}
            >
              <span className="text-white font-bold">{battleDetail.voteStats[1].votePercentage}%</span>
            </div>
          </div>
        </div>

        {/* 하단 정보 카드들 */}
        <div className="flex justify-center gap-8">
          {/* 시간 카드 */}
          <div className="bg-blue-100 p-6 rounded-[1rem] text-center shadow-md">
            <div className="text-4xl mb-2">⏱</div>
            <div className="text-3xl font-bold">{formatTime(battleDetail.totalTime)}</div>
          </div>

          {/* 승패 및 점수 카드 */}
          <div className="bg-yellow-100 p-6 rounded-[1rem] text-center shadow-md">
            <div className="text-4xl mb-2">
              {battleDetail.winner === true ? '🏆' : battleDetail.winner === false ? '💀' : '🤝'}
            </div>
            <div className="text-4xl font-bold text-red-500 mb-2">
              {battleDetail.winner === true ? '승' : battleDetail.winner === false ? '패' : '무'}
            </div>
            <div className="text-xl text-red-500">
              (+{battleDetail.earnedScore})
            </div>
          </div>

          {/* 참가자 정보 카드 */}
          <div className="bg-pink-100 p-6 rounded-[1rem] text-center shadow-md">
            <div className="text-4xl mb-2">
              👥
            </div>
            <div className="text-sm space-y-1">
              {battleDetail.participants.map((participant, index) => (
                <div key={index}>{participant}</div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 text-xl transition-colors"
        >
          ✕
        </button>
      </div>
    </dialog>
  );
};

export default BattleList;
