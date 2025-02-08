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
                {/* 아이콘 추가 */}
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
                {/* 아이콘 추가 */}
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
          {/* 아이콘 추가 */}
          점수 전환하기
        </button>
        </div>

      </div>

      {/* Inventory Area */}
      <div className="p-6 bg-white rounded-2xl shadow-lg w-3/4">
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

        <div className="flex gap-6">
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
          <div className="flex-1 bg-gray-50 rounded-2xl p-6 shadow-lg clay h-[300px] overflow-y-auto">
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
                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-[250px]"
                  >
                    {item.type === 1 ? (
                      <div className="flex flex-col gap-2 h-full">
                        <div className="bg-cusLightBlue-light rounded-lg p-4 flex justify-center items-center h-[180px]">
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
                        <div className="bg-cusLightBlue-light rounded-lg p-4 flex justify-center items-center h-[180px]">
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
