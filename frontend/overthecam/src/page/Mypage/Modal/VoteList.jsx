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
              <div className="text-cusRed text-lg font-bold flex items-center gap-2">
                A. {voteData.options[0].optionTitle}
                {voteData.options[0].selected && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="#00d899" 
                    className="w-8 h-8 check-animation"
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-cusBlue text-lg font-bold flex items-center gap-2">
                {voteData.options[1].selected && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="#00d899" 
                    className="w-8 h-8 check-animation"
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
                B. {voteData.options[1].optionTitle}
              </div>
            </div>
            <div className="h-12 rounded-[1rem] flex overflow-hidden relative">
              {voteData.options[0].votePercentage > 0 && (
                <div 
                  className="bg-cusRed h-full flex items-center clay"
                  style={{ width: `${voteData.options[0].votePercentage}%` }}
                >
                  <span className="absolute left-4 text-white font-bold text-lg">{Math.round(voteData.options[0].votePercentage)}%</span>
                </div>
              )}
              {voteData.options[1].votePercentage > 0 && (
                <div 
                  className="bg-cusBlue h-full flex items-center clay"
                  style={{ width: `${voteData.options[1].votePercentage}%` }}
                >
                  <span className="absolute right-4 text-white font-bold text-lg">{Math.round(voteData.options[1].votePercentage)}%</span>
                </div>
              )}
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
