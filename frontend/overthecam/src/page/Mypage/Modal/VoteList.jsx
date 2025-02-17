import React, { useState } from 'react';

function VoteDetailModal({ voteData, isLoading, onClose, clickedElement }) {
  if (isLoading || !voteData) return null;

  const getPosition = () => {
    if (!clickedElement) return {};
    
    const rect = clickedElement.getBoundingClientRect();
    const scrollY = window.scrollY;

    return {
      position: 'fixed',
      left: `${rect.left + (rect.width / 2)}px`,
      top: `${rect.bottom + scrollY + 10}px`,
      transform: 'translateX(-50%)',
      zIndex: 9999  // 매우 높은 z-index 값
    };
  };

  const handleOutsideClick = (e) => {
    // 모달 컨텐츠를 클릭한 경우는 무시
    if (e.target.closest('.modal-content')) {
      return;
    }
    onClose();
  };

  // 전체 데이터 구조 확인
  console.log('Full option 0:', JSON.stringify(voteData.options[0], null, 2));
  console.log('Full option 1:', JSON.stringify(voteData.options[1], null, 2));

  return (
    <div className="absolute top-0 left-0 w-full h-screen" onClick={handleOutsideClick}>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/50" 
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative w-full flex justify-center mt-4">
        <div className="modal-content bg-white w-[800px] p-6 rounded-[2rem] relative">
          {/* x 버튼 위치 수정 */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-center mb-3">{voteData.title}</h1>
          
          {/* 메타 정보 */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
            <span className="flex items-center gap-1">
              📅 {new Date(voteData.createdAt).toLocaleString()}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              👑 {voteData.creatorNickname}
            </span>
          </div>

          {/* 메인 투표 그래프 */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-cusRed text-lg font-bold">A. {voteData.options[0].optionTitle}</span>
              <span className="text-cusBlue text-lg font-bold">B. {voteData.options[1].optionTitle}</span>
            </div>
            <div className="h-12 bg-gray-100 rounded-[1rem] flex overflow-hidden relative clay">
              <div 
                className={`h-full flex items-center clay ${voteData.options[0].selected ? 'bg-cusRed' : 'bg-gray-400'}`}
                style={{ width: `${voteData.options[0].votePercentage}%` }}
              >
                <span className="absolute left-4 text-white font-bold text-lg">
                  {Math.round(voteData.options[0].votePercentage)}%
                </span>
              </div>
              <div 
                className={`h-full flex items-center clay ${voteData.options[1].selected ? 'bg-cusBlue' : 'bg-gray-400'}`}
                style={{ width: `${voteData.options[1].votePercentage}%` }}
              >
                <span className="absolute right-4 text-white font-bold text-lg">
                  {Math.round(voteData.options[1].votePercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* 성별 통계 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-center mb-3">성별 통계</h3>
            <div className="space-y-3">
              {['남성', '여성'].map((gender) => (
                <div key={gender} className="flex items-center">
                  <div className="w-[45%] flex justify-end">
                    <div className="bg-gray-100 w-full h-8 rounded-[0.5rem] relative clay">
                      <div
                        className="absolute right-0 h-full bg-gray-400 rounded-[0.5rem] flex items-center justify-end pr-3"
                        style={{ width: `${voteData.options[0].genderDistribution[gender]}%` }}
                      >
                        <span className="text-white text-sm">{voteData.options[0].genderDistribution[gender]}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-center font-medium text-sm">{gender}</div>
                  <div className="w-[45%]">
                    <div className="bg-gray-100 w-full h-8 rounded-[0.5rem] relative clay">
                      <div
                        className="absolute left-0 h-full bg-gray-400 rounded-[0.5rem] flex items-center justify-start pl-3"
                        style={{ width: `${voteData.options[1].genderDistribution[gender]}%` }}
                      >
                        <span className="text-white text-sm">{voteData.options[1].genderDistribution[gender]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 연령별 통계 */}
          <div>
            <h3 className="text-xl font-bold text-center mb-3">연령별 통계</h3>
            <div className="space-y-3">
              {['10대', '20대', '30대', '40대', '50대 이상'].map((age) => (
                <div key={age} className="flex items-center">
                  <div className="w-[45%] flex justify-end">
                    <div className="bg-gray-100 w-full h-8 rounded-[0.5rem] relative clay">
                      <div
                        className="absolute right-0 h-full bg-gray-400 rounded-[0.5rem] flex items-center justify-end pr-3"
                        style={{ width: `${voteData.options[0].ageDistribution[age]}%` }}
                      >
                        <span className="text-white text-sm">{voteData.options[0].ageDistribution[age]}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-center font-medium text-sm">{age}</div>
                  <div className="w-[45%]">
                    <div className="bg-gray-100 w-full h-8 rounded-[0.5rem] relative clay">
                      <div
                        className="absolute left-0 h-full bg-gray-400 rounded-[0.5rem] flex items-center justify-start pl-3"
                        style={{ width: `${voteData.options[1].ageDistribution[age]}%` }}
                      >
                        <span className="text-white text-sm">{voteData.options[1].ageDistribution[age]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoteDetailModal;
