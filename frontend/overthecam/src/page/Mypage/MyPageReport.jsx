import { useState, useEffect } from "react"
import BattleReportModal from "./Modal/BattleReportModal"
import { authAxios } from "../../common/axiosinstance"

function MyPageReport() {
  const [currentPage, setCurrentPage] = useState(1)
  const [battleReports, setBattleReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const reportsPerPage = 9

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  // API로 배틀 리포트 데이터 가져오기
  useEffect(() => {
    const fetchBattleReports = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await authAxios.get('/battles/reports', {
          params: {
            page: currentPage,
            size: reportsPerPage
          }
        })
        setBattleReports(response.data.content) // 백엔드 응답 구조에 맞게 조정
      } catch (err) {
        setError('리포트를 불러오는데 실패했습니다.')
        console.error('Failed to fetch battle reports:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBattleReports()
  }, [currentPage]) // currentPage가 변경될 때마다 데이터 다시 불러오기

  // 페이지네이션 처리
  const totalPages = Math.ceil(battleReports.length / reportsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const openModal = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  if (isLoading) {
    return (
      <div className="bg-[#EEF6FF] rounded-lg p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#EEF6FF] rounded-lg p-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <>
      {/* Reports Section */}
      <div className="bg-[#EEF6FF] rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">논쟁 분석 리포트</h2>
        {battleReports.length === 0 ? (
          <div className="text-center text-gray-500">
            아직 진행한 배틀이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {battleReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col h-32 relative"
              >
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{report.title}</h3>
                <div className="flex justify-end items-end absolute bottom-2 right-2">
                  <button
                    className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    onClick={() => openModal(report)}
                  >
                    more
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold ${
                  currentPage === number
                    ? "bg-[#A5C5F4] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </div>

      <BattleReportModal isOpen={isModalOpen} onClose={closeModal} report={selectedReport} />
    </>
  )
}

export default MyPageReport

