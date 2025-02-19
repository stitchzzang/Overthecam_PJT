import React, { useState, useEffect } from 'react';
import { authAxios } from '../../common/axiosinstance';
import ReportDetail from './Modal/ReportDetail';

const AiReport = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 9;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await authAxios.get("/mypage/reports");
        
        if (response.data && Array.isArray(response.data.report)) {
          // 데이터 구조 확인을 위한 로그
          console.log('Sample report data:', response.data.report[0]);
          setReports(response.data.report);
        } else {
          console.error('Unexpected data format:', response.data);
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error?.message || '리포트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleReportClick = async (reportId) => {
    try {
      setIsLoading(true);
      const response = await authAxios.get(`/mypage/reports/${reportId}`);
      
      console.log('Report detail response:', response);

      if (response.data) {
        setSelectedReport(response.data);
        setIsModalOpen(true);
      } else {
        setError('리포트를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError(error?.message || '리포트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // 날짜 포맷팅 함수 추가
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // 날짜와 시간 포맷팅
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').slice(0, -1); // 마지막 점 제거

      const formattedTime = date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

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
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        논쟁 분석 리포트
      </h1>
      
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>아직 생성된 리포트가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentReports.map((report) => (
              <div 
                key={report.id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleReportClick(report.id)}
              >
                <h3 className="text-lg font-semibold mb-3 break-words">
                  {report.title.split(' ').map((word, index) => (
                    <span key={index} className={word.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/) ? 'text-2xl mr-2' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDateTime(report.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === number 
                      ? "bg-cusBlue text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {selectedReport && (
        <ReportDetail
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
        />
      )}
    </div>
  );
};

export default AiReport;
