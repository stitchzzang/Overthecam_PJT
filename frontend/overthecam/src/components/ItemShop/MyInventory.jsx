"use client"

import { useEffect, useRef, useState } from "react"
import { getMyInventory } from "../../service/ItemShop/api"
import PointExchangeModal from "./ShopModal/PointExchangeModal"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid"
import { authAxios } from "../../common/axiosinstance"

function MyInventory() {
  const exchangeDialog = useRef()
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [myPoints, setMyPoints] = useState(0)
  const [myCheerScore, setMyCheerScore] = useState(0)
  const [filter, setFilter] = useState("all")
  const [myItems, setMyItems] = useState([])
  const [filteredMyItems, setFilteredMyItems] = useState([])

  // 페이지네이션 구현
  const [page, setPage] = useState(1)
  const itemsPerPage = 4
  const totalPages = Math.ceil(filteredMyItems.length / itemsPerPage)
  const paginatedItems = filteredMyItems.slice(page * itemsPerPage - itemsPerPage, page * itemsPerPage)

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  // 필터 변경
  useEffect(() => {
    const filteredItems = filter === "all" ? myItems : myItems.filter((item) => item.type === filter)
    setFilteredMyItems(filteredItems)
    setPage(1) // 필터 변경 시 첫 페이지로 리셋
  }, [myItems, filter])

  // 포인트 업데이트 함수
  const updatePoints = async () => {
    try {
      const response = await authAxios.get("/mypage/stats")
      if (response.data) {
        const { scoreInfo } = response.data
        if (scoreInfo) {
          setMyPoints(scoreInfo.point)
          setMyCheerScore(scoreInfo.supportScore)
        }
      }
    } catch (error) {
      console.error("포인트 정보 로드 실패:", error)
    }
  }

  // 실시간 포인트 업데이트를 위한 웹소켓 연결
  useEffect(() => {
    const ws = new WebSocket("wss://your-websocket-server-url")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "pointUpdate") {
        setMyPoints(data.points)
        setMyCheerScore(data.cheerScore)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  // 컴포넌트 마운트 시와 포커스 시 포인트 업데이트
  useEffect(() => {
    updatePoints()
    getMyInventory()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setMyItems(res.data)
        } else {
          setMyItems([])
        }
      })
      .catch((error) => {
        console.error("에러 발생:", error)
        setMyItems([])
      })
      .finally(() => {
        setIsLoading(false)
      })

    const handleFocus = () => {
      updatePoints()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, []) // Removed updatePoints from dependencies

  // 모달창 관련 이벤트 함수
  const onShowModal = () => {
    exchangeDialog.current.showModal()
  }

  // 오디오 재생 시작
  const handlePlay = () => {
    const audioElement = document.getElementById("audio-player")
    if (audioElement) {
      audioElement.play()
      setIsPlaying(true)
    }
  }

  // 오디오 재생 중지
  const handlePause = () => {
    const audioElement = document.getElementById("audio-player")
    if (audioElement) {
      audioElement.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="bg-cusGray-light m-2 sm:m-5 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Stats Column */}
        <div className="w-full lg:w-1/4">
          <h1 className="flex justify-start text-xl sm:text-2xl font-extrabold text-cusBlack-light drop-shadow-xl mb-4 sm:mb-6">
            내 아이템 보관함
          </h1>
          <div className="flex flex-col gap-4">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl p-4 clay">
              <div className="flex items-center gap-3">
                <div className="bg-cusLightBlue-light rounded-lg p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-cusBlue"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">응원 점수</p>
                  <p className="text-2xl font-bold text-cusBlue">{myCheerScore.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 clay">
              <div className="flex items-center gap-3">
                <div className="bg-cusPink-light rounded-lg p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-cusRed"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">포인트</p>
                  <p className="text-2xl font-bold text-cusRed">{myPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onShowModal}
              className="btn bg-cusBlue hover:bg-cusRed-light text-white rounded-xl p-4 transition-all duration-300 shadow-md"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
                <span>포인트 전환</span>
              </div>
            </button>

            <PointExchangeModal
              ref={exchangeDialog}
              myCheerScore={myCheerScore}
              myPoints={myPoints}
              onSuccess={(totalPoints, totalSupportScore) => {
                console.log("환전 후 전체 포인트:", totalPoints)
                console.log("환전 후 전체 응원점수:", totalSupportScore)

                // API가 반환하는 전체 값으로 직접 설정
                setMyPoints(totalPoints)
                setMyCheerScore(totalSupportScore)
              }}
            />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-4 clay">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-0.5">
                {[
                  { id: "all", label: "전체" },
                  { id: "FRAME", label: "프레임" },
                  { id: "EFFACT", label: "효과음" },
                  { id: "MASK", label: "가면" },
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setFilter(category.id)
                      setPage(1)
                    }}
                    className={`
                      px-4 sm:px-6 py-1 rounded-xl sm:rounded-tl-xl sm:rounded-tr-xl sm:rounded-b-none font-semibold transition-all duration-300 flex-1 min-w-20 sm:min-w-24 h-10 sm:h-12
                      ${
                        filter === category.id
                          ? "bg-cusGray-light text-cusBlack-light !hover:bg-cusPink-light !active:bg-cusPink-light"
                          : "bg-cusGray text-cusBlack-light !hover:bg-cusPink-light !active:bg-cusPink-light"
                      }
                    `}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              {/* Pagination controls */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={page === 1}
                    className="px-4 py-2 bg-cusGray text-cusBlack rounded-xl hover:bg-cusLightBlue-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-cusGray text-cusBlack rounded-xl hover:bg-cusLightBlue-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Items Grid */}
            <div className="bg-cusGray-light rounded-2xl p-4 sm:p-6 shadow-lg clay h-full min-h-[260px] overflow-y-auto mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center space-x-3 h-full">
                  <div className="loading"></div>
                  <p className="text-xl font-semibold text-cusBlue drop-shadow-lg">로딩 중...</p>
                </div>
              ) : filteredMyItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedItems.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 clay group hover:-translate-y-1"
                    >
                      {item.type === "EFFACT" ? (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="bg-cusPink rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusPink-light">
                            <button
                              onClick={isPlaying ? handlePause : handlePlay}
                              className="w-12 h-12 rounded-full bg-cusRed hover:bg-cusRed-light flex items-center justify-center text-white transition-all duration-300 shadow-md"
                            >
                              {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                            </button>
                          </div>
                          <p className="text-cusRed font-semibold text-center mt-2">{item.name}</p>
                          <audio id="audio-player" className="hidden" src={item.audioUrl} controls />{" "}
                          {/* Added audio source */}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="bg-cusLightBlue-light rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusLightBlue">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <p className="text-cusBlue font-semibold text-center mt-2">{item.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-xl font-semibold text-cusBlack-light drop-shadow-lg">
                    해당 카테고리에 아이템이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyInventory

