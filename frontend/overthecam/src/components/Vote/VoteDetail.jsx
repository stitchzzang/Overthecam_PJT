import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoteDeleteModal from './VoteModal/VoteDeleteModal';
import { authAxios } from '../../common/axiosinstance';

const VoteDetail = ({ voteData, onDelete }) => {
  const navigate = useNavigate();
  const deleteModalRef = useRef();
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVoteData, setCurrentVoteData] = useState(voteData);

  // creatorUserId로 비교 로직 수정
  const userInfo = localStorage.getItem('userInfo');
  const currentUserId = userInfo ? JSON.parse(userInfo).userId : null;
  const isCreator = Number(currentUserId) === Number(voteData?.creatorUserId);

  // 사용자의 투표 여부 확인
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!currentUserId) return;
      
      try {
        // 최신 투표 데이터 먼저 가져오기
        const voteResponse = await authAxios.get(`/vote/${voteData.voteId}`);
        if (voteResponse.data) {
          setCurrentVoteData(voteResponse.data);
          // hasVoted 상태를 투표 데이터에서 확인
          setHasVoted(voteResponse.data.hasVoted || false);
        }
      } catch (error) {
        console.error('투표 데이터 가져오기 중 오류 발생:', error);
      }
    };

    checkVoteStatus();
  }, [voteData.voteId, currentUserId]);

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

  const getAgeGroup = (age) => {
    if (age < 20) return '10';
    if (age < 30) return '20';
    if (age < 40) return '30';
    if (age < 50) return '40';
    return '50';
  };

  const handleVote = async (optionId) => {
    try {
      if (!userInfo) {
        alert('로그인이 필요합니다.');
        return;
      }

      const userInfoObj = JSON.parse(userInfo);
      const age = calculateAge(userInfoObj.birth);
      const ageGroup = getAgeGroup(age);
      const gender = userInfoObj.gender === 0 ? 'male' : 'female';

      // 먼저 UI 업데이트
      setHasVoted(true);
      
      // 현재 투표 데이터를 복사하여 업데이트
      const updatedVoteData = JSON.parse(JSON.stringify(currentVoteData));
      
      // 선택한 옵션의 투표 수 증가
      updatedVoteData.options = updatedVoteData.options.map(option => ({
        ...option,
        voteCount: option.optionId === optionId ? option.voteCount + 1 : option.voteCount
      }));

      // 총 투표수 계산
      const newTotalVotes = updatedVoteData.options.reduce((sum, opt) => sum + opt.voteCount, 0);

      // 퍼센티지 업데이트
      updatedVoteData.options = updatedVoteData.options.map(option => ({
        ...option,
        votePercentage: (option.voteCount / newTotalVotes) * 100,
        genderDistribution: {
          ...option.genderDistribution,
          [userInfoObj.gender === 0 ? '남성' : '여성']: 
            option.optionId === optionId ? 100 : 0
        },
        ageDistribution: {
          ...option.ageDistribution,
          [`${ageGroup}대${ageGroup === '50' ? ' 이상' : ''}`]: 
            option.optionId === optionId ? 100 : 0
        }
      }));

      // UI 즉시 업데이트
      setCurrentVoteData(updatedVoteData);

      // 서버에 투표 요청
      await authAxios.post(`/vote/${voteData.voteId}/vote/${optionId}`, {
        age: ageGroup,
        gender: gender
      });

      // 서버에서 최신 데이터 가져오기
      const voteResponse = await authAxios.get(`/vote/${voteData.voteId}`);
      if (voteResponse.data) {
        setCurrentVoteData(voteResponse.data);
      }

    } catch (error) {
      console.error('투표 처리 중 오류 발생:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        setHasVoted(false); // UI 롤백
      } else {
        // 다른 에러는 무시하고 UI는 업데이트된 상태 유지
        console.log('투표 처리 중 오류가 발생했지만 UI는 유지됩니다.');
      }
    }
  };

  // 총 투표 수 계산
  const totalVotes = currentVoteData.options.reduce((sum, option) => sum + option.voteCount, 0);

  if (!currentVoteData) return <div>로딩 중...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8">
      <button
        onClick={() => navigate('/main/vote')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className="w-6 h-6"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15.75 19.5L8.25 12l7.5-7.5" 
          />
        </svg>
        <span>투표 목록으로</span>
      </button>

      <div className="clay bg-cusLightBlue-lighter rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-4">{currentVoteData.title}</h1>
        
        {/* 메타 정보 */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {new Date(currentVoteData.createdAt).toLocaleString('ko-KR', {
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
            {currentVoteData.creatorNickname}
          </span>
        </div>

        {/* 투표 설명 */}
        <p className="text-gray-700 mb-6 text-center">{currentVoteData.content}</p>

        {/* 투표 버튼 또는 결과 표시 */}
        {!hasVoted && currentVoteData.active ? (
          <div className="flex gap-4 mb-8">
            {currentVoteData.options.map((option) => (
              <button
                key={option.optionId}
                onClick={() => handleVote(option.optionId)}
                className={`clay flex-1 p-4 ${
                  option.optionId === currentVoteData.options[0].optionId
                    ? 'bg-red-100 hover:bg-red-200 text-cusRed'
                    : 'bg-blue-100 hover:bg-blue-200 text-cusBlue'
                } rounded-lg transition-colors text-lg font-bold`}
              >
                {option.optionTitle}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* 투표 옵션 제목 */}
            <div className="flex justify-between mb-2">
              <div className="text-cusRed font-bold text-lg">
                A. {currentVoteData.options[0].optionTitle}
              </div>
              <div className="text-cusBlue font-bold text-lg">
                B. {currentVoteData.options[1].optionTitle}
              </div>
            </div>
            {/* 투표 결과 그래프 */}
            <div className="relative h-12 clay bg-gray-200 rounded-full overflow-hidden">
              {currentVoteData.options[0].votePercentage > 0 && (
                <div
                  className="absolute left-0 top-0 h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold text-lg"
                  style={{ width: `${currentVoteData.options[0].votePercentage >= 100 ? 100 : currentVoteData.options[0].votePercentage}%` }}
                >
                  {Math.round(currentVoteData.options[0].votePercentage)}% ({currentVoteData.options[0].voteCount}명)
                </div>
              )}
              {currentVoteData.options[1].votePercentage > 0 && (
                <div
                  className="absolute right-0 top-0 h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold text-lg"
                  style={{ width: `${currentVoteData.options[1].votePercentage >= 100 ? 100 : currentVoteData.options[1].votePercentage}%` }}
                >
                  {Math.round(currentVoteData.options[1].votePercentage)}% ({currentVoteData.options[1].voteCount}명)
                </div>
              )}
            </div>
            {/* "명 참여중" 텍스트를 제거하고 여백만 유지 */}
            <div className="mb-8"></div>

            {/* 통계 섹션 */}
            {totalVotes > 0 && (
              <>
                {/* 성별 통계 */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-center mb-4">성별 통계</h3>
                  <div className="space-y-3">
                    {/* 남성 통계 */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                        <div
                          className="absolute right-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                          style={{ 
                            width: `${(currentVoteData.options[0].genderDistribution['남성'] * currentVoteData.options[0].votePercentage / 100) || 0}%` 
                          }}
                        >
                          {Math.round((currentVoteData.options[0].genderDistribution['남성'] * currentVoteData.options[0].votePercentage / 100) || 0)}%
                        </div>
                      </div>
                      <span className="w-16 text-center font-bold text-sm">남성</span>
                      <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                        <div
                          className="absolute left-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                          style={{ 
                            width: `${(currentVoteData.options[1].genderDistribution['남성'] * currentVoteData.options[1].votePercentage / 100) || 0}%` 
                          }}
                        >
                          {Math.round((currentVoteData.options[1].genderDistribution['남성'] * currentVoteData.options[1].votePercentage / 100) || 0)}%
                        </div>
                      </div>
                    </div>
                    {/* 여성 통계 */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                        <div
                          className="absolute right-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                          style={{ 
                            width: `${(currentVoteData.options[0].genderDistribution['여성'] * currentVoteData.options[0].votePercentage / 100) || 0}%` 
                          }}
                        >
                          {Math.round((currentVoteData.options[0].genderDistribution['여성'] * currentVoteData.options[0].votePercentage / 100) || 0)}%
                        </div>
                      </div>
                      <span className="w-16 text-center font-bold text-sm">여성</span>
                      <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                        <div
                          className="absolute left-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                          style={{ 
                            width: `${(currentVoteData.options[1].genderDistribution['여성'] * currentVoteData.options[1].votePercentage / 100) || 0}%` 
                          }}
                        >
                          {Math.round((currentVoteData.options[1].genderDistribution['여성'] * currentVoteData.options[1].votePercentage / 100) || 0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 연령별 통계 */}
                <div className="mb-16">
                  <h3 className="text-xl font-bold text-center mb-4">연령별 통계</h3>
                  <div className="space-y-3">
                    {['10대', '20대', '30대', '40대', '50대 이상'].map((age) => (
                      <div key={age} className="flex items-center justify-center gap-4">
                        <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                          <div
                            className="absolute right-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                            style={{ 
                              width: `${(currentVoteData.options[0].ageDistribution[age] * currentVoteData.options[0].votePercentage / 100) || 0}%` 
                            }}
                          >
                            {Math.round((currentVoteData.options[0].ageDistribution[age] * currentVoteData.options[0].votePercentage / 100) || 0)}%
                          </div>
                        </div>
                        <span className="w-16 text-center font-bold text-sm">{age}</span>
                        <div className="w-[32%] h-8 clay bg-gray-200 rounded-full relative">
                          <div
                            className="absolute left-0 top-0 h-full clay bg-gray-400 rounded-full flex items-center justify-start pl-2 text-white text-sm"
                            style={{ 
                              width: `${(currentVoteData.options[1].ageDistribution[age] * currentVoteData.options[1].votePercentage / 100) || 0}%` 
                            }}
                          >
                            {Math.round((currentVoteData.options[1].ageDistribution[age] * currentVoteData.options[1].votePercentage / 100) || 0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* 투표가 없을 경우 메시지 표시 */}
        {totalVotes === 0 && (
          <div className="text-center text-gray-500 my-8">
            아직 투표 결과가 없습니다.
          </div>
        )}

        {/* 하단 정보와 삭제 버튼 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              참여 {totalVotes}명
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              댓글 {currentVoteData.commentCount}개
            </span>
          </div>
          {isCreator && (
            <button 
              onClick={() => deleteModalRef.current?.showModal()}
              className="btn px-6 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink text-sm font-medium text-center"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <VoteDeleteModal ref={deleteModalRef} onDelete={onDelete} />
    </div>
  );
};

export default VoteDetail;