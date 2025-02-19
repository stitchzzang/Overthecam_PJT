import React, { useState, useEffect } from 'react';
import { authAxios } from '../../../common/axiosinstance';

const ReportDetail = ({ isOpen, onClose, report }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!report?.id) return;
      
      try {
        setLoading(true);
        const response = await authAxios.post(`/mypage/reports/${report.id}`);
        if (response.success) {
          setReportData(response.data);
        }
      } catch (error) {
        console.error("리포트 상세 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchReportDetail();
    }
  }, [isOpen, report?.id]);

  if (!isOpen) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <p className="text-lg">로딩 중...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{reportData?.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">{reportData?.createdAt?.split('T')[0]}</p>
        </div>

        {/* 모달 컨텐츠 */}
        <div className="p-6 space-y-8">
          {/* 요약 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">토론 요약</h3>
            <p className="text-gray-700">{reportData?.summary}</p>
          </div>

          {/* 감정 분석 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">감정 분석</h3>
            <div className="grid grid-cols-5 gap-4">
              {reportData?.emotionAnalysis && Object.entries(reportData.emotionAnalysis).map(([emotion, percentage]) => (
                <div key={emotion} className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="font-medium mb-2">{emotion}</h4>
                  <p className="text-blue-600">{percentage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 주요 논점 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">주요 논점</h3>
            <ul className="space-y-2">
              {reportData?.keyArguments?.map((argument, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{argument}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 토론 분석 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">토론 분석</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">주요 발언</h4>
                <ul className="space-y-2">
                  {reportData?.debateAnalysis?.주요발언?.map((statement, index) => (
                    <li key={index} className="text-gray-700">• {statement}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">토론에서의 역할</h4>
                  <p className="text-gray-700">{reportData?.debateAnalysis?.토론에서의역할}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">논리적 설득력</h4>
                  <p className="text-blue-600 text-xl font-bold">{reportData?.debateAnalysis?.논리적설득력점수}/10</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI 종합 평가 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">AI 종합 평가</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{reportData?.aiEvaluation?.종합평가}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
