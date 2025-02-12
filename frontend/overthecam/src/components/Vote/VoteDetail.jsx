import React, { useState } from 'react';

const VoteDetail = ({ voteData, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // creatorUserId로 비교 로직 수정
  const userInfo = localStorage.getItem('userInfo');
  const currentUserId = JSON.parse(userInfo).userId;
  const isCreator = Number(currentUserId) === Number(voteData?.creatorUserId);

  console.log('비교 확인:', {
    currentUserId: Number(currentUserId),
    creatorUserId: Number(voteData?.creatorUserId),
    isCreator: isCreator
  });

  const handleDeleteClick = async () => {
    const confirmed = window.confirm('정말로 이 투표를 삭제하시겠습니까?');
    if (confirmed) {
      const success = await onDelete();
      if (success) {
        // 삭제 성공 시 추가 처리
      }
    }
  };

  // 사용자 나이 계산 함수
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 연령대 변환 함수
  const getAgeGroup = (age) => {
    if (age < 20) return '10';
    if (age < 30) return '20';
    if (age < 40) return '30';
    if (age < 50) return '40';
    return '50';
  };

  // 투표 처리 함수 수정
  const handleVote = async (optionId) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 사용자 정보에서 성별과 생년월일 가져오기
      const userInfo = JSON.parse(userInfoStr);
      const age = calculateAge(userInfo.birth);
      const ageGroup = getAgeGroup(age);
      const gender = userInfo.gender === 0 ? 'male' : 'female';

      // 투표 요청에 성별과 연령대 정보 포함
      const response = await authAxios.post(`/vote/${voteData.voteId}/vote/${optionId}`, {
        age: ageGroup,
        gender: gender
      });

      if (response.status === 200) {
        window.location.reload(); // 또는 다른 상태 업데이트 방식 사용
      }
    } catch (error) {
      console.error('투표 처리 중 오류 발생:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
      }
    }
  };

  if (!voteData) return <div>로딩 중...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8">
      <div className="clay bg-cusLightBlue-lighter rounded-lg shadow-lg p-6">
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-center mb-4">{voteData.title}</h1>
        
        {/* 메타 정보 */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {new Date(voteData.createdAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {voteData.creatorNickname}
          </span>
        </div>

        {/* 투표 설명 */}
        <p className="text-gray-700 mb-6 text-center">{voteData.content}</p>

        {/* 투표 옵션 제목 */}
        <div className="flex justify-between mb-4 text-xl">
          <div className="text-red-500">A. {voteData.options[0].optionTitle}</div>
          <div className="text-blue-500">B. {voteData.options[1].optionTitle}</div>
        </div>

        {/* 투표 결과 그래프 */}
        <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden mb-8">
          <div
            className="absolute left-0 top-0 h-full bg-red-400 flex items-center justify-start pl-4 text-white font-bold"
            style={{ width: `${voteData.options[0].votePercentage}%` }}
          >
            {voteData.options[0].votePercentage}%
          </div>
          <div
            className="absolute right-0 top-0 h-full bg-blue-400 flex items-center justify-end pr-4 text-white font-bold"
            style={{ width: `${voteData.options[1].votePercentage}%` }}
          >
            {voteData.options[1].votePercentage}%
          </div>
        </div>

        {/* 성별 통계 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-4">성별 통계</h3>
          <div className="space-y-3">
            {/* 남성 통계 */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                <div
                  className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                  style={{ width: `${voteData.options[0].genderDistribution['남성'] || 0}%` }}
                >
                  {Math.round(voteData.options[0].genderDistribution['남성'] || 0)}%
                </div>
              </div>
              <span className="w-16 text-center font-bold">남성</span>
              <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                <div
                  className="absolute left-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                  style={{ width: `${voteData.options[1].genderDistribution['남성'] || 0}%` }}
                >
                  {Math.round(voteData.options[1].genderDistribution['남성'] || 0)}%
                </div>
              </div>
            </div>
            {/* 여성 통계 */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                <div
                  className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                  style={{ width: `${voteData.options[0].genderDistribution['여성'] || 0}%` }}
                >
                  {Math.round(voteData.options[0].genderDistribution['여성'] || 0)}%
                </div>
              </div>
              <span className="w-16 text-center font-bold">여성</span>
              <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                <div
                  className="absolute left-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                  style={{ width: `${voteData.options[1].genderDistribution['여성'] || 0}%` }}
                >
                  {Math.round(voteData.options[1].genderDistribution['여성'] || 0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 연령별 통계 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-4">연령별 통계</h3>
          <div className="space-y-3">
            {['10대', '20대', '30대', '40대', '50대 이상'].map((age) => (
              <div key={age} className="flex items-center justify-center gap-4">
                <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                    style={{ width: `${voteData.options[0].ageDistribution[age] || 0}%` }}
                  >
                    {Math.round(voteData.options[0].ageDistribution[age] || 0)}%
                  </div>
                </div>
                <span className="w-16 text-center font-bold">{age}</span>
                <div className="w-[38%] h-8 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                    style={{ width: `${voteData.options[1].ageDistribution[age] || 0}%` }}
                  >
                    {Math.round(voteData.options[1].ageDistribution[age] || 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 정보와 삭제 버튼 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              참여 {voteData.options.reduce((sum, option) => sum + option.voteCount, 0)}명
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              댓글 {voteData.commentCount}개
            </span>
          </div>
          {isCreator && (
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="btn clay px-6 py-2 bg-btnPink hover:bg-btnPink-hover hover:text-white rounded-lg transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">투표 삭제</h3>
            <p className="mb-6">정말로 이 투표를 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="clay px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteClick}
                className="clay px-4 py-2 bg-btnPink hover:bg-btnPink-hover hover:text-white rounded transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteDetail;