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
        
        if (response.success) {
          setReports(response.data);
        } else {
          setError(response.error?.message || '리포트를 불러오는데 실패했습니다.');
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
      const response = await authAxios.post(`/mypage/reports/${reportId}`);
      
      if (response.success) {
        setSelectedReport(response.data);
        setIsModalOpen(true);
      } else {
        setError(response.error?.message || '리포트를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError(error?.message || '리포트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지네이션 계산
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

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
                <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(report.createdAt).toLocaleDateString()}
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
