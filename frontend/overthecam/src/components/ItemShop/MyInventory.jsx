import { useEffect, useRef, useState } from "react";
import Pagination from "react-js-pagination";
import { getMyInventory } from "../../service/ItemShop/api";
import PointExchangeModal from "./PointExchangeModal";

function MyInventory() {
  const exchangeDialog = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myPoints, setMyPoints] = useState(200);
  const [myCheerScore, setMyCheerScore] = useState(1000);
  const [filter, setFilter] = useState(3);
  const [myItems, setMyItems] = useState([
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
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredMyItems.length / itemsPerPage);
  const paginatedItems = filteredMyItems.slice(
    page * itemsPerPage - itemsPerPage,
    page * itemsPerPage
  );

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
      filter === 3 ? myItems : myItems.filter((item) => item.type === filter);
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

  return (
    <div className="bg-cusLightBlue-lighter m-5 rounded-lg">
      <div className="relative p-5 left-5">
        <h3 className="absolute left-3 text-2xl font-semibold">
          내 아이템 보기
        </h3>
      </div>
      <div className="my-items-container flex m-4">
        <div className="w-1/4 my-assets m-5 flex flex-col items-center">
          <div className="my-points justify-center w-full">
            <div className="my-cheer-scores bg-cusGray-dark w-1/2 min-w-[200px] max-w-[200px] min-h-[50px] clay m-2">
              <p className="text-sm font-semibold">응원 점수</p>
              <p className="text-xl font-bold text-center overflow-hidden">
                {myCheerScore}
              </p>
            </div>
            <div className="my-points bg-cusGray-dark w-1/2 min-w-[200px] max-w-[200px]  min-h-[50px] clay m-2">
              <p className="text-sm font-semibold">포인트</p>
              <p className="text-xl font-bold text-center overflow-hidden">
                {myPoints}
              </p>
            </div>
          </div>
          <div className="exchange-btn p-2">
            <button className="btn" onClick={onShowModal}>
              전환하기
            </button>
          </div>
        </div>
        <PointExchangeModal
          ref={exchangeDialog}
          myCheerScore={myCheerScore}
          myPoints={myPoints}
          onSuccess={handleExchange}
        />
        <div className="my-inventory w-3/4 mt-10 mr-10 ml-5 mb-10">
          <div className="my-inventory-box flex">
            <div>
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={`px-3 py-2 bg-blue-500 text-white rounded-lg 
        transition-all duration-300 disabled:bg-gray-300`}
              >
                ◀
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className={`px-3 py-2 bg-blue-500 text-white rounded-lg 
        transition-all duration-300 disabled:bg-gray-300`}
              >
                ▶
              </button>
            </div>
          </div>
          <div className="my-inventroy-category w-1/6">
            <div className="category-button-list">
              <button
                onClick={() => {
                  setFilter(3);
                  setPage(1);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                전체보기
              </button>
              <button
                onClick={() => {
                  setFilter(0);
                  setPage(1);
                }}
              >
                프레임
              </button>
              <button
                onClick={() => {
                  setFilter(1);
                  setPage(1);
                }}
              >
                효과음
              </button>
              <button
                onClick={() => {
                  setFilter(2);
                  setPage(1);
                }}
              >
                가면
              </button>
            </div>
          </div>
          <div className="my-inventory-container overflow-y-auto h-50 w-5/6">
            <div className="my-inventory-content">
              {isLoading ? (
                <>
                  <p>...Loading</p>
                </>
              ) : filteredMyItems.length > 0 ? (
                paginatedItems.map((item, i) => (
                  <div key={i}>
                    {item.type === 1 ? (
                      <>
                        <p>{item.name}</p> <audio id="audio-player" />
                        <button onClick={isPlaying ? handlePause : handlePlay}>
                          {isPlaying ? "⏸️" : "▶️"}
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{item.name}</p> <img />
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p>해당 카테고리에 상품이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MyInventory;
