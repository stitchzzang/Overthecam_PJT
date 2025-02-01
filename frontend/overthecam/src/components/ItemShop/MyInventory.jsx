import { useEffect, useState } from "react";
import { getMyInventory } from "../../service/ItemShop/api";

function MyInventory() {
  const [isLoading, setIsLoading] = useState(true);
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

  // 여기 구현만 해두고 나중에 모달창으로 옮김
  const pointExchange = () => {
    const newScore = 100;
    const newPoint = 10;
    // 환전 수식
    if (myCheerScore >= 1000) {
      // 1000이상일 때만 전환 진행 입력값 (1000단위 입력) 나눠서 newPoint에 입력
    }
    // 요청 후 값 수정
    setMyCheerScore((prev) => prev - newScore);
    setMyPoints((prev) => prev + newPoint);
    // 계산 된 값 score 차감, point 더해서 post 요청
  };

  const filteredMyItems =
    filter === 3 ? myItems : myItems.filter((item) => item.type === filter);
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
            <button onClick={pointExchange}>전환하기</button>
          </div>
          <div>
            <p>포인트</p>
            <p>{myPoints}</p>
          </div>
          <div>
            <h3>내 아이템 창고</h3>
            <div>
              <button onClick={() => setFilter(3)}>전체보기</button>
              <button onClick={() => setFilter(0)}>프레임</button>
              <button onClick={() => setFilter(1)}>효과음</button>
              <button onClick={() => setFilter(2)}>가면</button>
            </div>
            <div>
              {isLoading ? (
                <>
                  <p>...Loading</p>
                </>
              ) : filteredMyItems.length > 0 ? (
                filteredMyItems.map((item, i) => (
                  <div key={i}>
                    <p>{item.name}</p>
                  </div>
                ))
              ) : (
                <p>해당 카테고리에 상품이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyInventory;
