function VoteDetailModal({ voteData, isLoading, onClose }) {
  if (isLoading) {
    return (
      <dialog className="modal fixed inset-0 z-50 flex items-center justify-center rounded-[2rem]" open>
        <div className="bg-white rounded-lg p-6">
          <p>로딩 중...</p>
        </div>
      </dialog>
    );
  }

  if (!voteData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <dialog className="modal fixed inset-0 z-50 flex items-center justify-center rounded-[2rem]" open>
      <div className="bg-white w-full max-w-[180rem] relative shadow-2xl rounded-[2rem]" 
           style={{ 
             margin: '0',
             padding: '2rem'
           }}
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Vote Detail</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600 text-lg">
            <span>📅 {formatDate(voteData.createdAt)}</span>
            <span>|</span>
            <span>👤 {voteData.creatorNickname}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-8 mb-6">
          <div className="text-2xl font-bold text-center mb-6">
            {voteData.title}
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-red-500 text-xl font-bold">A. {voteData.options[0].optionTitle}</span>
            <span className="text-blue-500 text-xl font-bold">B. {voteData.options[1].optionTitle}</span>
          </div>
          <div className="h-14 bg-gray-200 rounded-[2rem] overflow-hidden flex">
            {voteData.options[0].votePercentage === 100 ? (
              <div 
                className="bg-red-400 transition-all duration-300 flex items-center justify-end pr-4 w-full"
              >
                <span className="text-white font-bold">100%</span>
              </div>
            ) : voteData.options[1].votePercentage === 100 ? (
              <div 
                className="bg-blue-400 transition-all duration-300 flex items-center justify-start pl-4 w-full"
              >
                <span className="text-white font-bold">100%</span>
              </div>
            ) : (
              <>
                <div 
                  className="bg-red-400 transition-all duration-300 flex items-center justify-end pr-4"
                  style={{ width: `${voteData.options[0].votePercentage}%` }}
                >
                  <span className="text-white font-bold">{voteData.options[0].votePercentage}%</span>
                </div>
                <div 
                  className="bg-blue-400 transition-all duration-300 flex items-center justify-start pl-4"
                  style={{ width: `${voteData.options[1].votePercentage}%` }}
                >
                  <span className="text-white font-bold">{voteData.options[1].votePercentage}%</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6 px-40">
          <div>
            <h3 className="text-2xl font-bold text-center mb-4">성별 통계</h3>
            <div className="space-y-3">
              {Object.entries(voteData.options[0].genderDistribution).map(([gender, percentage]) => (
                <div key={gender} className="flex items-center">
                  <div className="w-[45%] flex justify-end items-center">
                    {voteData.options[0].genderDistribution[gender] === 0 ? (
                      <span>0%</span>
                    ) : (
                      <div 
                        className="bg-gray-300 h-7 rounded-l-full transition-all duration-300 flex justify-end items-center"
                        style={{ width: `${voteData.options[0].genderDistribution[gender]}%` }}
                      >
                        <span className="px-3">{voteData.options[0].genderDistribution[gender]}%</span>
                      </div>
                    )}
                  </div>
                  <div className="w-40 text-center font-medium">{gender}</div>
                  <div className="w-[45%] flex items-center">
                    {voteData.options[1].genderDistribution[gender] === 0 ? (
                      <span>0%</span>
                    ) : (
                      <div 
                        className="bg-gray-300 h-7 rounded-r-full transition-all duration-300 flex justify-start items-center"
                        style={{ width: `${voteData.options[1].genderDistribution[gender]}%` }}
                      >
                        <span className="px-3">{voteData.options[1].genderDistribution[gender]}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-4">연령별 통계</h3>
            <div className="space-y-3">
              {Object.entries(voteData.options[0].ageDistribution).map(([age, percentage]) => (
                <div key={age} className="flex items-center">
                  <div className="w-[45%] flex justify-end items-center">
                    {voteData.options[0].ageDistribution[age] === 0 ? (
                      <span>0%</span>
                    ) : (
                      <div 
                        className="bg-gray-300 h-7 rounded-l-full transition-all duration-300 flex justify-end items-center"
                        style={{ width: `${voteData.options[0].ageDistribution[age]}%` }}
                      >
                        <span className="px-3">{voteData.options[0].ageDistribution[age]}%</span>
                      </div>
                    )}
                  </div>
                  <div className="w-40 text-center font-medium">{age}</div>
                  <div className="w-[45%] flex items-center">
                    {voteData.options[1].ageDistribution[age] === 0 ? (
                      <span>0%</span>
                    ) : (
                      <div 
                        className="bg-gray-300 h-7 rounded-r-full transition-all duration-300 flex justify-start items-center"
                        style={{ width: `${voteData.options[1].ageDistribution[age]}%` }}
                      >
                        <span className="px-3">{voteData.options[1].ageDistribution[age]}%</span>
                      </div>
                    )}
                  </div>
                </div>
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
}

export default VoteDetailModal;
