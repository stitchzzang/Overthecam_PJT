import React, { useState, useEffect } from 'react';
import { authAxios } from "../../common/axiosinstance";

const AiReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo || !userInfo.userId) {
          setError('사용자 정보를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        const response = await authAxios.post(`/report/generate/${userInfo.userId}`, {
          userId: Number(userInfo.userId)
        });
        
        if (response.success) {
          console.log('Report Data:', response.data.report);
          setReportData(response.data.report);
        } else {
          setError(response.error?.message || '리포트를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setError(error.error?.message || '리포트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cusBlue"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {reportData && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 제목 */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {reportData.title}
          </h1>

          {/* 요약 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">요약</h2>
            <p className="text-gray-700">{reportData.summary}</p>
          </div>

          {/* 감정 분석 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">감정 분석</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(reportData.emotion_analysis).map(([emotion, value]) => (
                <div key={emotion} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-medium text-gray-700">{emotion}</div>
                  <div className="text-lg font-bold text-cusBlue">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 주요 주장 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">주요 주장</h2>
            <ul className="list-disc pl-6 space-y-2">
              {reportData.key_arguments.map((argument, index) => (
                <li key={index} className="text-gray-700">{argument}</li>
              ))}
            </ul>
          </div>

          {/* 토론 스타일 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">토론 스타일</h2>
            <p className="text-gray-700">{reportData.debate_style}</p>
          </div>

          {/* 제안 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">개선 제안</h2>
            <p className="text-gray-700">{reportData.suggestions}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiReport;
