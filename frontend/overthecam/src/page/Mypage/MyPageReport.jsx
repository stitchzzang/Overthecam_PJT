import { useState, useRef } from "react"
import NavBar from "../../components/Layout/NavBar"
import BattleReportModal from "./Modal/BattleReportModal"

function MyPageReport() {
  const [userData, setUserData] = useState({
    id: "",
    password: "",
    name: "",
    nickname: "",
    birthDate: "",
    email: "",
    stats: {
      cheerPoints: 0,
      points: 0,
      followers: 0,
      following: 0,
      record: {
        wins: 0,
        draws: 0,
        losses: 0,
      },
    },
  })

  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const fileInputRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 9

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  // Sample battle reports data
  const battleReports = [
    {
      id: 1,
      title: "라면 스프 논쟁: 먼저 vs 나중에",
      date: "2025-03-15",
      result: "승리",
      opponent: "스프매니아",
      analysis:
        "라면 스프를 나중에 넣는 것이 더 맛있다는 주장으로 승리했습니다. 과학적 근거와 맛의 차이를 설득력 있게 설명한 점이 주효했습니다.",
    },
    {
      id: 2,
      title: "김치찌개 vs 된장찌개",
      date: "2025-03-10",
      result: "무승부",
      opponent: "찌개마스터",
      analysis:
        "두 찌개의 장단점을 객관적으로 비교하여 무승부로 끝났습니다. 영양가와 맛의 다양성 측면에서 균형 잡힌 논쟁을 펼쳤습니다.",
    },
    {
      id: 3,
      title: "여름 휴가지: 산 vs 바다",
      date: "2025-02-28",
      result: "패배",
      opponent: "해변러버",
      analysis:
        "산의 장점을 충분히 어필하지 못해 패배했습니다. 다음에는 산의 독특한 매력과 액티비티를 더 강조해야 할 것 같습니다.",
    },
    {
      id: 4,
      title: "아이스 아메리카노 vs 핫 아메리카노",
      date: "2025-02-20",
      result: "승리",
      opponent: "커피홀릭",
      analysis:
        "계절에 상관없이 아이스 아메리카노의 장점을 설득력 있게 제시하여 승리했습니다. 카페인 흡수율과 풍미 유지에 대한 논리가 효과적이었습니다.",
    },
    {
      id: 5,
      title: "대중교통 vs 자가용",
      date: "2025-02-15",
      result: "승리",
      opponent: "카러버",
      analysis:
        "환경 보호와 경제성 측면에서 대중교통의 우수성을 입증하여 승리했습니다. 통계 자료를 효과적으로 활용한 점이 돋보였습니다.",
    },
    {
      id: 6,
      title: "아침형 인간 vs 저녁형 인간",
      date: "2025-02-08",
      result: "무승부",
      opponent: "올빼미족",
      analysis:
        "개인의 생체리듬과 생활 패턴에 따라 장단점이 다르다는 점을 인정하며 무승부로 마무리되었습니다. 양측의 과학적 근거가 팽팽했습니다.",
    },
    {
      id: 7,
      title: "강아지 vs 고양이",
      date: "2025-02-01",
      result: "패배",
      opponent: "캣맘",
      analysis:
        "감정에 호소하는 논리로 인해 패배했습니다. 다음에는 객관적인 데이터와 반려동물의 특성을 더 체계적으로 비교해야 할 것 같습니다.",
    },
    {
      id: 8,
      title: "운동: 유산소 vs 무산소",
      date: "2025-01-25",
      result: "승리",
      opponent: "헬스마니아",
      analysis:
        "균형 잡힌 운동 계획의 중요성을 강조하며 두 운동의 조화로운 병행을 주장하여 승리했습니다. 과학적 근거와 실제 사례를 잘 활용했습니다.",
    },
    {
      id: 9,
      title: "영화관 vs 넷플릭스",
      date: "2025-01-18",
      result: "무승부",
      opponent: "시네필",
      analysis:
        "각각의 장단점을 객관적으로 비교하여 무승부로 끝났습니다. 영화 감상 경험의 다양성을 인정하는 결론을 도출했습니다.",
    },
    {
      id: 10,
      title: "아날로그 vs 디지털",
      date: "2025-01-10",
      result: "승리",
      opponent: "테크노보이",
      analysis:
        "디지털의 효율성과 혁신성을 강조하면서도 아날로그의 가치를 인정하는 균형 잡힌 주장으로 승리했습니다. 미래 지향적 관점이 돋보였습니다.",
    },
    {
      id: 11,
      title: "현금 vs 카드",
      date: "2025-01-03",
      result: "패배",
      opponent: "머니구루",
      analysis:
        "디지털 결제의 편리성만을 강조하다 보안과 개인정보 보호 측면에서 약점을 보여 패배했습니다. 다음에는 양측의 장단점을 더 균형있게 다뤄야겠습니다.",
    },
    {
      id: 12,
      title: "재택근무 vs 사무실근무",
      date: "2024-12-28",
      result: "승리",
      opponent: "워크라이프",
      analysis:
        "재택근무의 생산성과 삶의 질 향상 효과를 구체적인 데이터로 입증하여 승리했습니다. 현대 사회의 트렌드를 잘 반영한 주장이었습니다.",
    },
    {
      id: 13,
      title: "스키 vs 스노보드",
      date: "2024-12-20",
      result: "무승부",
      opponent: "슬로프킹",
      analysis:
        "두 겨울 스포츠의 특징과 매력을 공정하게 비교하여 무승부로 마무리되었습니다. 개인의 선호도와 경험에 따라 선택이 달라질 수 있음을 인정했습니다.",
    },
    {
      id: 14,
      title: "맥OS vs 윈도우",
      date: "2024-12-15",
      result: "승리",
      opponent: "PC마스터",
      analysis:
        "각 운영체제의 장단점을 객관적으로 비교하면서도 사용자 경험의 중요성을 강조하여 승리했습니다. 기술적 지식과 실용적 관점의 조화가 돋보였습니다.",
    },
    {
      id: 15,
      title: "온라인 쇼핑 vs 오프라인 쇼핑",
      date: "2024-12-08",
      result: "무승부",
      opponent: "쇼핑의신",
      analysis:
        "두 쇼핑 방식의 장단점을 균형있게 제시하여 무승부로 끝났습니다. 소비자의 상황과 제품 특성에 따라 선택이 달라질 수 있다는 결론을 도출했습니다.",
    },
  ]

  // Calculate pagination
  const totalPages = Math.ceil(battleReports.length / reportsPerPage)
  const indexOfLastReport = currentPage * reportsPerPage
  const indexOfFirstReport = indexOfLastReport - reportsPerPage
  const currentReports = battleReports.slice(indexOfFirstReport, indexOfLastReport)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const openModal = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">My Page</h1>

        {/* 프로필 및 통계 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 프로필 이미지 섹션 */}
            <div className="flex-shrink-0 w-full md:w-40">
              <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setProfileImage(e.target.result)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <button
                className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => fileInputRef.current.click()}
              >
                이미지 변경
              </button>
            </div>

            {/* 통계 정보 섹션 */}
            <div className="flex-grow">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">응원점수</p>
                  <p className="text-2xl font-bold">{userData.stats.cheerPoints}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">포인트</p>
                  <p className="text-2xl font-bold">{userData.stats.points}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">팔로워</p>
                  <p className="text-2xl font-bold">{userData.stats.followers}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">팔로잉</p>
                  <p className="text-2xl font-bold">{userData.stats.following}</p>
                </div>
              </div>

              {/* 전적 섹션 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">내 전적</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-blue-500 text-2xl font-bold">{userData.stats.record.wins}</p>
                    <p className="text-sm text-gray-600">승</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-2xl font-bold">{userData.stats.record.draws}</p>
                    <p className="text-sm text-gray-600">무</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-500 text-2xl font-bold">{userData.stats.record.losses}</p>
                    <p className="text-sm text-gray-600">패</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {userData.nickname} 님의 승률은{" "}
                  {(
                    (userData.stats.record.wins /
                      (userData.stats.record.wins + userData.stats.record.draws + userData.stats.record.losses)) *
                    100
                  ).toFixed(1)}
                  % 입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 논쟁 분석 리포트 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">논쟁 분석 리포트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col justify-between h-32 relative"
              >
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{report.title}</h3>
                <button
                  className="absolute bottom-2 right-2 w-10 h-6 bg-blue-100 text-blue-600 rounded-full text-[10px] font-semibold hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => openModal(report)}
                >
                  More
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                    currentPage === number ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BattleReportModal isOpen={isModalOpen} onClose={closeModal} report={selectedReport} />
    </div>
  )
}

export default MyPageReport

