import { useEffect, useRef, useState } from "react";
import { getMyInventory } from "../../service/ItemShop/api";
import PointExchangeModal from "./PointExchangeModal";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function MyInventory() {
  const exchangeDialog = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myPoints, setMyPoints] = useState(200);
  const [myCheerScore, setMyCheerScore] = useState(1000);
  const [filter, setFilter] = useState("all");
  const [myItems, setMyItems] = useState([
    {
      name: "기본프레임",
      price: 200,
      detail: "프레임 입니다",
      imageUrl: "",
      type: "FRAME",
    },
    {
      name: "박수소리",
      price: 300,
      detail: "박수를 칩니다",
      imageUrl: "",
      type: 1,
    },
    {
      name: "기본프레임",
      price: 200,
      detail: "프레임 입니다",
      imageUrl: "",
      type: 0,
    },
    {
      name: "박수소리",
      price: 300,
      detail: "박수를 칩니다",
      imageUrl: "",
      type: 1,
    },
    {
      name: "기본프레임",
      price: 200,
      detail: "프레임 입니다",
      imageUrl: "",
      type: 0,
    },
    {
      name: "박수소리",
      price: 300,
      detail: "박수를 칩니다",
      imageUrl: "",
      type: 1,
    },
  ]);
  const [filteredMyItems, setFilteredMyItems] = useState(myItems);

  // 페이지네이션 구현
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredMyItems.length / itemsPerPage);
  const paginatedItems = filteredMyItems.slice(
    page * itemsPerPage - itemsPerPage,
    page * itemsPerPage
  );
  // 페이지네이션 디자인용
  const [isThisPage, setIsThisPage] = useState(3);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // 필터 변경
  useEffect(() => {
    const filteredItems =
      filter === "all"
        ? myItems
        : myItems.filter((item) => item.type === filter);
    setFilteredMyItems(filteredItems);
  }, [myItems, filter]);

  useEffect(() => {
    // 내 포인트, 응원 점수, 내가 가진 아이템 목록 받아오기
    getMyInventory()
      .then((res) => {
        setMyItems(res.data);
        console.log("데이터 불러오기 성공", res.data);
      })
      .catch((error) => {
        console.log("데이터 불러오기 실패", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 모달창 관련 이벤트 함수
  const onShowModal = () => {
    exchangeDialog.current.showModal();
  };

  // 오디오 재생 시작
  const handlePlay = () => {
    const audioElement = document.getElementById("audio-player");
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  // 오디오 재생 중지
  const handlePause = () => {
    const audioElement = document.getElementById("audio-player");
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  // 환전 이후 값 받기
  const handleExchange = (convertedPoint, remainingScore) => {
    setMyCheerScore(remainingScore);
    setMyPoints(convertedPoint);
  };

  const handleTabChange = (e) => {};

  return (
    <div className="bg-cusLightBlue-lighter m-5 rounded-2xl p-6 flex">
      {/* Stats Area with Exchange Button */}
      <div className="relative w-1/4">
        <h1 className="flex justify-start text-2xl font-extrabold text-cusBlue drop-shadow-xl mb-6">
          내 아이템 보관함
        </h1>
        <div className="flex flex-col gap-4 mb-12 mr-8">
          {/* 응원 점수 */}
          <div className="bg-white rounded-xl p-4 clay flex-1 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-cusLightBlue rounded-lg p-3">
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
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">응원 점수</p>
                <p className="text-2xl font-bold text-cusBlue">
                  {myCheerScore.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 포인트 */}
          <div className="bg-white rounded-xl p-4 clay flex-1 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-cusLightBlue rounded-lg p-3">
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
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">포인트</p>
                <p className="text-2xl font-bold text-cusBlue">
                  {myPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {/* 전환 버튼 */}
          <button
            onClick={onShowModal}
            className=" text-white btn hover:bg-cusBlue"
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
        </div>
      </div>

      {/* Inventory Area */}
      <div className="p-3 bg-gradient-to-b from-cusPink to-cusLightBlue rounded-2xl clay w-3/4">
        <div className="bg-[rgb(255,255,255,0.3)] rounded-2xl p-3 shadow-lg">
          {/* Pagination controls */}
          <div className="flex justify-end mb-6">
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-cusLightBlue text-white rounded-xl hover:bg-cusBlue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="px-4 py-2 bg-cusLightBlue text-white rounded-xl hover:bg-cusBlue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Category sidebar */}
            <div className="flex flex-col gap-1 w-48">
              {[
                { id: "all", label: "전체보기" },
                { id: "FRAME", label: "프레임" },
                { id: "EFFACT", label: "효과음" },
                { id: "MASK", label: "가면" },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setFilter(category.id);
                    setPage(1);
                  }}
                  className={`
                  p-4 rounded-xl font-semibold text-left transition-all duration-300 shadow-md clay
                  ${
                    filter === category.id
                      ? "bg-cusBlue text-white"
                      : "bg-cusLightBlue-light text-cusBlue hover:bg-cusLightBlue hover:text-white"
                  }
                `}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="flex-1 bg-cusLightBlue-lighter rounded-2xl p-6 shadow-lg clay h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center space-x-3 h-full">
                  <div className="loading"></div>
                  <p className="text-xl font-semibold text-cusBlue drop-shadow-lg">
                    로딩 중...
                  </p>
                </div>
              ) : filteredMyItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 h-full">
                  {paginatedItems.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-[230px] clay"
                    >
                      {item.type === 1 ? (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="bg-cusLightBlue-lighter rounded-lg p-4 flex justify-center items-center h-[180px]">
                            <button
                              onClick={isPlaying ? handlePause : handlePlay}
                              className="w-12 h-12 rounded-full bg-cusBlue hover:bg-cusLightBlue flex items-center justify-center text-white transition-all duration-300 shadow-md"
                            >
                              {isPlaying ? "⏸️" : "▶️"}
                            </button>
                          </div>
                          <p className="text-cusBlue font-semibold text-center mt-2">
                            {item.name}
                          </p>
                          <audio id="audio-player" className="hidden" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="bg-cusLightBlue-lighter rounded-lg p-4 flex justify-center items-center h-[180px]">
                            <img
                              src="/api/placeholder/120/120"
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <p className="text-cusBlue font-semibold text-center mt-2">
                            {item.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-xl font-semibold text-cusBlue drop-shadow-lg">
                    해당 카테고리에 아이템이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PointExchangeModal
        ref={exchangeDialog}
        myCheerScore={myCheerScore}
        myPoints={myPoints}
        onSuccess={handleExchange}
      />
    </div>
  );
}
export default MyInventory;
