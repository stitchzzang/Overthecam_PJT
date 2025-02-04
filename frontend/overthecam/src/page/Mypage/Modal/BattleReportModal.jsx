import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

function BattleReportModal({ isOpen, onClose, report }) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimationComplete(false)
      const timer = setTimeout(() => {
        setIsAnimationComplete(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen || !report) return null

  // 리포트별 감정 분석 데이터
  const emotionData = {
    // 김치찜 vs 제육볶음
    1: {
      emotions: [
        { name: "분노", percentage: 80, color: "#60A5FA" },
        { name: "침착", percentage: 15, color: "#FCA5A5" },
        { name: "웃음", percentage: 3, color: "#86EFAC" },
        { name: "기타", percentage: 2, color: "#E5E7EB" },
      ],
      type: "격렬한 토론가",
      typeColor: "red",
      winRate: "60%",
      summary: ["한국인이라면 무조건 김치다.", "제육은 느끼하다.", "김치찜은 국물이 있어서 든든하게 먹을 수 있다."],
      analysis:
        "정해기 님은 격렬한 토론가 유형입니다. 주장하는 바에 대해서 절대 물러서지 않고 끝까지 주장을 하시는 스타일입니다.",
    },
    // 산 vs 바다
    2: {
      emotions: [
        { name: "즐거움", percentage: 45, color: "#F472B6" },
        { name: "열정", percentage: 30, color: "#F59E0B" },
        { name: "차분", percentage: 20, color: "#60A5FA" },
        { name: "기타", percentage: 5, color: "#E5E7EB" },
      ],
      type: "창의적 토론가",
      typeColor: "blue",
      winRate: "75%",
      summary: ["산과 바다는 각자의 매력이 있다.", "계절별로 선호도가 다르다.", "활동성 측면에서는 산이 더 좋다."],
      analysis:
        "다양한 관점에서 논리를 펼치는 창의적인 토론 스타일을 보여주셨습니다. 특히 계절별 장단점 분석이 돋보였습니다.",
    },
    // 아침형 vs 저녁형
    3: {
      emotions: [
        { name: "이성적", percentage: 60, color: "#8B5CF6" },
        { name: "공감", percentage: 25, color: "#EC4899" },
        { name: "호기심", percentage: 10, color: "#10B981" },
        { name: "기타", percentage: 5, color: "#E5E7EB" },
      ],
      type: "분석적 토론가",
      typeColor: "purple",
      winRate: "85%",
      summary: ["생체리듬은 개인차가 크다.", "직업과 환경에 따라 달라진다.", "효율성은 개인의 리듬에 달렸다."],
      analysis:
        "과학적 근거를 바탕으로 논리를 전개하는 분석적인 토론 스타일이 인상적입니다. 상대방의 의견도 존중하면서 자신의 주장을 펼쳤습니다.",
    },
  }

  // 현재 리포트의 감정 데이터 가져오기
  const currentData = emotionData[report.id] || emotionData[1]

  // 도넛 차트 계산
  const createDonutSegments = () => {
    let currentAngle = 0
    return currentData.emotions.map((emotion) => {
      const angle = (emotion.percentage / 100) * 360
      const segment = {
        start: currentAngle,
        end: currentAngle + angle,
        color: emotion.color,
      }
      currentAngle += angle
      return segment
    })
  }

  const segments = createDonutSegments()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-3 max-w-lg w-full mx-4 relative overflow-y-auto max-h-[90vh]"
            style={{
              backgroundImage:
                "linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* 노트북 상단 디자인 */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-white border-b flex items-center px-2 space-x-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-300 rounded-full" />
              ))}
            </div>

            <div className="mt-3">
              <h2 className="text-xl font-bold text-center mb-4">Battle Report</h2>
              <h3 className="text-base font-bold text-center mb-3">{report.title}</h3>
            </div>

            {/* 비교 바 차트 */}
            <div className="mb-4">
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentData.winRate }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full bg-red-400"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="text-white font-bold">A. {report.title.split(" vs ")[0]}</span>
                  <span className="text-gray-700 font-bold">B. {report.title.split(" vs ")[1]}</span>
                </div>
              </div>
            </div>

            {/* 감정 분석 섹션 */}
            <div className="mb-4">
              <div className="bg-yellow-50 p-1 rounded-lg mb-2 text-sm">
                <p className="text-center font-bold">
                  {report.opponent} 님은 <span className={`text-${currentData.typeColor}-500`}>{currentData.type}</span>{" "}
                  유형입니다.
                </p>
              </div>

              <h4 className="text-sm font-bold mb-2 text-center">논쟁의 감정 변화</h4>

              <div className="flex justify-center items-center space-x-4">
                {/* 도넛 차트 */}
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {segments.map((segment, index) => (
                      <motion.path
                        key={index}
                        d={`
                          M 50 50
                          L ${50 + 40 * Math.cos((segment.start * Math.PI) / 180)} ${
                            50 + 40 * Math.sin((segment.start * Math.PI) / 180)
                          }
                          A 40 40 0 ${segment.end - segment.start > 180 ? 1 : 0} 1 ${
                            50 + 40 * Math.cos((segment.end * Math.PI) / 180)
                          } ${50 + 40 * Math.sin((segment.end * Math.PI) / 180)}
                          Z
                        `}
                        fill={segment.color}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    ))}
                    <circle cx="50" cy="50" r="25" fill="white" />
                  </svg>
                </div>

                {/* 감정 범례 */}
                <div className="space-y-0.5 text-xs">
                  {currentData.emotions.map((emotion, index) => (
                    <motion.div
                      key={emotion.name}
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                      <span>
                        {emotion.name} - {emotion.percentage}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* 분석 섹션 */}
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-bold text-center text-blue-500 mb-1"># 논쟁 요약</h4>
                <p className="text-center text-gray-600 text-xs">
                  {currentData.summary.map((line, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className="block"
                    >
                      {line}
                    </motion.span>
                  ))}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-center text-blue-500 mb-1"># 논쟁 타입 분석</h4>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-gray-600 text-center text-xs"
                >
                  {currentData.analysis}
                </motion.p>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              닫기
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BattleReportModal

