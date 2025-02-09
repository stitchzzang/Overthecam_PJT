import React from 'react';

const VoteDetail = ({ voteData }) => {
  if (!voteData) return <div>로딩 중...</div>;

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{voteData.title}</h1>
        <p className="text-gray-700 mb-6">{voteData.content}</p>
        
        <div className="flex justify-between mb-4 text-sm text-gray-500">
          <span>작성자: {voteData.creatorNickname}</span>
          <span>댓글 {voteData.commentCount}개</span>
        </div>

        {/* 투표 결과 그래프 */}
        <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden mb-6">
          <div
            className="absolute left-0 top-0 h-full bg-red-500 flex items-center justify-start pl-4 text-white font-bold"
            style={{ width: `${voteData.options[0].votePercentage}%` }}
          >
            {voteData.options[0].optionTitle} ({voteData.options[0].votePercentage}%)
          </div>
          <div
            className="absolute right-0 top-0 h-full bg-blue-500 flex items-center justify-end pr-4 text-white font-bold"
            style={{ width: `${voteData.options[1].votePercentage}%` }}
          >
            {voteData.options[1].optionTitle} ({voteData.options[1].votePercentage}%)
          </div>
        </div>

        {/* 성별 통계 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-4">성별 통계</h3>
          <div className="flex items-center justify-center gap-4">
            {/* 왼쪽 옵션 */}
            <div className="flex-1 text-right">
              <div className="h-8 bg-gray-200 rounded-lg relative mb-2">
                <div
                  className="absolute right-0 top-0 h-full bg-red-400 rounded-lg flex items-center justify-end pr-2 text-white"
                  style={{ width: `${voteData.options[0].genderDistribution?.male || 0}%` }}
                >
                  {voteData.options[0].genderDistribution?.male || 0}%
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded-lg relative">
                <div
                  className="absolute right-0 top-0 h-full bg-red-400 rounded-lg flex items-center justify-end pr-2 text-white"
                  style={{ width: `${voteData.options[0].genderDistribution?.female || 0}%` }}
                >
                  {voteData.options[0].genderDistribution?.female || 0}%
                </div>
              </div>
            </div>
            
            {/* 중앙 레이블 */}
            <div className="text-center font-bold">
              <div className="h-8 flex items-center mb-2">남성</div>
              <div className="h-8 flex items-center">여성</div>
            </div>
            
            {/* 오른쪽 옵션 */}
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded-lg relative mb-2">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-400 rounded-lg flex items-center justify-start pl-2 text-white"
                  style={{ width: `${voteData.options[1].genderDistribution?.male || 0}%` }}
                >
                  {voteData.options[1].genderDistribution?.male || 0}%
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded-lg relative">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-400 rounded-lg flex items-center justify-start pl-2 text-white"
                  style={{ width: `${voteData.options[1].genderDistribution?.female || 0}%` }}
                >
                  {voteData.options[1].genderDistribution?.female || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 연령대 통계 */}
        <div>
          <h3 className="text-xl font-bold text-center mb-4">연령별 통계</h3>
          <div className="space-y-2">
            {['10', '20', '30', '40'].map((age) => (
              <div key={age} className="flex items-center justify-center gap-4">
                {/* 왼쪽 옵션 */}
                <div className="flex-1 text-right">
                  <div className="h-8 bg-gray-200 rounded-lg relative">
                    <div
                      className="absolute right-0 top-0 h-full bg-red-400 rounded-lg flex items-center justify-end pr-2 text-white"
                      style={{ width: `${voteData.options[0].ageDistribution?.[age] || 0}%` }}
                    >
                      {voteData.options[0].ageDistribution?.[age] || 0}%
                    </div>
                  </div>
                </div>
                
                {/* 중앙 레이블 */}
                <div className="w-16 text-center font-bold">
                  {age}대
                </div>
                
                {/* 오른쪽 옵션 */}
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-lg relative">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-400 rounded-lg flex items-center justify-start pl-2 text-white"
                      style={{ width: `${voteData.options[1].ageDistribution?.[age] || 0}%` }}
                    >
                      {voteData.options[1].ageDistribution?.[age] || 0}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-right text-sm text-gray-600">
          총 투표수: {voteData.options.reduce((sum, option) => sum + option.voteCount, 0)}
        </div>
      </div>
    </div>
  );
};

export default VoteDetail;