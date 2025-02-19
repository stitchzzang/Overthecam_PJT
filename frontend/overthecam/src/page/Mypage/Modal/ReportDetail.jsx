import React, { useState, useEffect } from 'react';
import { authAxios } from '../../../common/axiosinstance';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReportDetail = ({ isOpen, onClose, report }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 퍼센트 반올림 함수 추가
  const roundPercent = (percentStr) => {
    const num = parseFloat(percentStr.replace('%', ''));
    return (Math.round(num * 10) / 10) + '%';
  };

  // 차트 데이터 생성 함수
  const createChartData = (emotionAnalysis) => {
    if (!emotionAnalysis) return null;

    const data = Object.entries(emotionAnalysis).map(([emotion, value]) => {
      const num = parseFloat(value.replace('%', ''));
      return Math.round(num * 10) / 10; // 소수점 첫째 자리까지 반올림
    });

    const labels = Object.keys(emotionAnalysis);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',  // 분노 - 빨강
            'rgba(54, 162, 235, 0.8)',  // 기쁨 - 파랑
            'rgba(255, 206, 86, 0.8)',  // 불안 - 노랑
            'rgba(75, 192, 192, 0.8)',  // 슬픔 - 청록
            'rgba(153, 102, 255, 0.8)', // 중립 - 보라
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 차트 옵션 업데이트
  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label} (${data.datasets[0].data[i]}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 1,
                hidden: false,
                index: i
              }));
            }
            return [];
          }
        }
      },
      datalabels: {
        // 차트 내부 레이블 비활성화
        display: false
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 20
    }
  };

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!report?.id) return;
      
      try {
        setLoading(true);
        const response = await authAxios.get(`/mypage/reports/${report.id}`);
        if (response.success && response.data) {
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

  // 모달 외부 클릭 핸들러 추가
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <p className="text-lg">로딩 중...</p>
      </div>
    </div>
  );

  const chartData = createChartData(reportData?.emotionAnalysis);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick} // 외부 클릭 핸들러 추가
    >
      <div 
        className="bg-white rounded-xl w-[800px] max-h-[80vh] overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-opacity-95"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 중단
      >
        {/* 모달 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold text-gray-800">{reportData?.title}</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {reportData?.createdAt ? new Date(reportData.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace('.', '') : '날짜 정보 없음'}
          </p>
        </div>

        {/* 모달 컨텐츠 - 스크롤바 스타일링 */}
        <div 
          className="p-6 space-y-8 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide"
          style={{
            scrollbarWidth: 'none',  // Firefox
            msOverflowStyle: 'none',  // IE and Edge
            WebkitOverflowScrolling: 'touch'  // iOS momentum scrolling
          }}
        >
          {/* 요약 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">토론 요약</h3>
            <p className="text-gray-700">{reportData?.summary}</p>
          </div>

          {/* 감정 분석 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">감정 분석</h3>
            <div className="flex items-center justify-center">
              <div className="h-[300px] w-[500px] relative">
                {chartData && <Pie data={chartData} options={chartOptions} />}
              </div>
            </div>
          </div>

          {/* 감정 분석 요약 카드 - 2행 구조로 변경 */}
          {reportData?.emotionAnalysis && (
            <div className="space-y-4">
              {/* 상단 2개 카드 */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(reportData.emotionAnalysis)
                  .sort(([,a], [,b]) => parseFloat(b.replace('%', '')) - parseFloat(a.replace('%', '')))
                  .slice(0, 2)
                  .map(([emotion, value]) => (
                    <div key={emotion} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">
                        {emotion === '분노' ? '😡' : 
                         emotion === '기쁨' ? '😊' :
                         emotion === '불안' ? '😰' :
                         emotion === '슬픔' ? '😢' : '🤔'}
                      </div>
                      <div className="font-bold">{emotion}</div>
                      <div className="text-blue-600">{roundPercent(value)}</div>
                    </div>
                ))}
              </div>
              
              {/* 하단 3개 카드 */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(reportData.emotionAnalysis)
                  .sort(([,a], [,b]) => parseFloat(b.replace('%', '')) - parseFloat(a.replace('%', '')))
                  .slice(2)
                  .map(([emotion, value]) => (
                    <div key={emotion} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">
                        {emotion === '분노' ? '😡' : 
                         emotion === '기쁨' ? '😊' :
                         emotion === '불안' ? '😰' :
                         emotion === '슬픔' ? '😢' : '🤔'}
                      </div>
                      <div className="font-bold">{emotion}</div>
                      <div className="text-blue-600">{roundPercent(value)}</div>
                    </div>
                ))}
              </div>
            </div>
          )}

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
              {/* 주요 발언 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">주요 발언</h4>
                <ul className="space-y-2">
                  {reportData?.debateAnalysis?.["주요 발언"]?.map((statement, index) => (
                    <li key={index} className="text-gray-700">• {statement}</li>
                  ))}
                </ul>
              </div>

              {/* 토론 분석 카드들 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 토론에서의 역할 */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 transition-all hover:shadow-md">
                  <h4 className="font-semibold mb-2 text-blue-800">토론에서의 역할</h4>
                  <div className="flex items-start">
                    <span className="text-2xl mr-2">👥</span>
                    <p className="text-gray-700">{reportData?.debateAnalysis?.["토론에서의 역할"]}</p>
                  </div>
                </div>

                {/* 감정적 반응 분석 */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 transition-all hover:shadow-md">
                  <h4 className="font-semibold mb-2 text-purple-800">감정적 반응 분석</h4>
                  <div className="flex items-start">
                    <span className="text-2xl mr-2">🎭</span>
                    <p className="text-gray-700">{reportData?.debateAnalysis?.["감정적 반응 분석"]}</p>
                  </div>
                </div>

                {/* 논쟁 발생 시 반응 */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 transition-all hover:shadow-md">
                  <h4 className="font-semibold mb-2 text-green-800">논쟁 발생 시 반응</h4>
                  <div className="flex items-start">
                    <span className="text-2xl mr-2">⚡</span>
                    <p className="text-gray-700">{reportData?.debateAnalysis?.["논쟁 발생 시 반응"]}</p>
                  </div>
                </div>

                {/* 논리적 설득력 */}
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 transition-all hover:shadow-md">
                  <h4 className="font-semibold mb-2 text-orange-800">논리적 설득력</h4>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🎯</span>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {reportData?.debateAnalysis?.["논리적 설득력 점수"]}<span className="text-lg text-gray-600">/10</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                        <div 
                          className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${(reportData?.debateAnalysis?.["논리적 설득력 점수"] / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI 종합 평가 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">AI 종합 평가</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{reportData?.aiEvaluation?.["종합 평가"]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS를 추가하여 Webkit 브라우저의 스크롤바 숨기기
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);

export default ReportDetail;
