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
  ]);
  const [filteredMyItems, setFilteredMyItems] = useState(myItems);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  // 한 페이지당 8개 보여준다
  const itemsPerPage = 1;
  // slice할 index범위
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    const filteredItems =
      filter === 3 ? myItems : myItems.filter((item) => item.type === filter);
    setFilteredMyItems(filteredItems);
  }, [myItems, filter]);

  useEffect(() => {
    // 페이지에 맞는 항목만 선택하여 currentList에 설정
    setCurrentList(filteredMyItems.slice(indexOfFirstItem, indexOfLastItem));
  }, [filteredMyItems, page]); // 필터링된 항목과 페이지가 변경될 때마다 실행

  const changePageHandler = (page) => {
    setPage(page);
  };

  useEffect(() => {
    // 내 포인트, 응원 점수, 내가 가진 아이템 목록 받아오기
    getMyInventory()
      .then((res) => {
        setMyItems(res.data.items);
        setMyCheerScore(res.data.score); // response 양식 보고 수정할 것
        setMyPoints(res.data.points); // response 양식 보고 수정할 것
      })
      .catch((error) => {
        console.log("데이터 불러오기 실패", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const onShowModal = () => {
    exchangeDialog.current.showModal();
  };
  const handlePlay = () => {
    const audioElement = document.getElementById("audio-player");
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

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
    <>
      <div>
        <p>내 화면 테스트</p>
      </div>
      <div>
        <div>
          <div>
            <p>응원 점수</p>
            <p>{myCheerScore}</p>
            <button onClick={onShowModal}>전환하기</button>
            <PointExchangeModal
              ref={exchangeDialog}
              myCheerScore={myCheerScore}
              myPoints={myPoints}
              onSuccess={handleExchange}
            />
          </div>
          <div>
            <p>포인트</p>
            <p>{myPoints}</p>
          </div>
          <div>
            <h3>내 아이템 창고</h3>
            <div>
              <button
                onClick={() => {
                  setFilter(3);
                  setPage(1);
                }}
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
            <div>
              {isLoading ? (
                <>
                  <p>...Loading</p>
                </>
              ) : currentList.length > 0 ? (
                currentList.map((item, i) => (
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
            <Pagination
              activePage={page}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={filteredMyItems.length} // 필터링된 항목 개수로 페이지네이션 설정
              pageRangeDisplayed={0}
              prevPageText={"<"}
              nextPageText={">"}
              onChange={changePageHandler}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default MyInventory;
