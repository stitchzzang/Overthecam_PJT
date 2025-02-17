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

  // 무승부 판별 함수 추가
  const isDraw = (voteStats) => {
    return Math.abs(voteStats[0].votePercentage - voteStats[1].votePercentage) < 1;  // 1% 미만 차이면 무승부
  };

  if (!isOpen || !battleDetail) return null;

  const handleOutsideClick = (e) => {
    if (e.target.closest('.modal-content')) {
      return;
    }
    onClose();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-screen" onClick={handleOutsideClick}>
      <div className="relative w-full flex justify-center mt-4">
        <div className="modal-content bg-white w-[800px] p-6 rounded-[2rem] relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>

          {/* 상단 제목 영역 */}
          <h1 className="text-2xl font-bold text-center mb-3">Battle Detail</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
            <span className="flex items-center gap-1">
              📅 {formatDate(battleDetail.createdAt)}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              👑 {battleDetail?.hostNickname}
            </span>
          </div>

          {/* 배틀 결과 그래프 영역 */}
          <div className="mb-6">
            <div className="text-2xl font-bold text-gray-600 text-center mb-2">
              {battleDetail.title}
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-cusRed text-lg font-bold">A. {battleDetail.voteStats[0].optionTitle}</span>
              <span className="text-cusBlue text-lg font-bold">B. {battleDetail.voteStats[1].optionTitle}</span>
            </div>
            <div className="h-12 rounded-[1rem] flex overflow-hidden relative">
              <div 
                className="bg-cusRed h-full flex items-center clay"
                style={{ width: `${battleDetail.voteStats[0].votePercentage}%` }}
              >
                <span className="absolute left-4 text-white font-bold text-lg">
                  {Math.round(battleDetail.voteStats[0].votePercentage)}%
                </span>
              </div>
              <div 
                className="bg-cusBlue h-full flex items-center clay"
                style={{ width: `${battleDetail.voteStats[1].votePercentage}%` }}
              >
                <span className="absolute right-4 text-white font-bold text-lg">
                  {Math.round(battleDetail.voteStats[1].votePercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* 하단 정보 카드들 */}
          <div className="flex justify-center gap-8">
            {/* 시간 카드 */}
            <div className="bg-cusBlue-light p-6 rounded-[1rem] text-center shadow-md w-[200px]">
              <div className="text-4xl mb-2">⏱</div>
              <div className="text-3xl font-bold">{formatTime(battleDetail.totalTime)}</div>
            </div>

            {/* 승패 및 점수 카드 */}
            <div className="bg-cusYellow-light p-6 rounded-[1rem] text-center shadow-md w-[200px]">
              <div className="text-4xl mb-2">
                {isDraw(battleDetail.voteStats) ? '🤝' : 
                 battleDetail.winner ? '🏆' : '💀'}
              </div>
              <div className="text-4xl font-bold text-red-500 mb-2">
                {isDraw(battleDetail.voteStats) ? '무' : 
                 battleDetail.winner ? '승' : '패'}
              </div>
              <div className="text-xl text-red-500">
                (+{battleDetail.earnedScore})
              </div>
            </div>

            {/* 참가자 정보 카드 */}
            <div className="bg-cusPink-light p-6 rounded-[1rem] text-center shadow-md w-[200px]">
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
        </div>
      </div>
    </div>
  );
};

export default BattleList;
