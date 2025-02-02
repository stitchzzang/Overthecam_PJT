import { useState, useEffect } from "react";
import ItemListItem from "./ItemListItem";
import { getItem } from "../../service/ItemShop/api";

function ItemList() {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(3);
  const [order, setOrder] = useState(0); // 포인트 낮은 순서
  const [Items, setItems] = useState([
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
      name: "강아지 가면",
      price: 700,
      detail: "멍멍",
      imageUrl: "",
      type: 2,
    },
    {
        name: "고양이 가면",
        price: 500,
        detail: "야옹",
        imageUrl: "",
        type: 2,
      },
  ]);

  useEffect(() => {
    setIsLoading(true);
    // axios 요청
    getItem()
      .then((res) => {
        setItems(res.data);
      })
      .catch((error) => {
        console.log("데이터 불러오기 실패", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredItems =
    filter === 3 ? Items : Items.filter((item) => item.type === filter);

  const orderedItems = [...filteredItems].sort((a, b) =>
    order === 0 ? a.price - b.price : b.price - a.price
  );

  return (
    <>
      <div>
        <button onClick={() => setFilter(3)}>전체보기</button>
        <button onClick={() => setFilter(0)}>프레임</button>
        <button onClick={() => setFilter(1)}>효과음</button>
        <button onClick={() => setFilter(2)}>가면</button>
      </div>
      <div>
        <button onClick={() => setOrder(0)}>포인트 낮은 순</button>
        <button onClick={() => setOrder(1)}>포인트 높은 순</button>
      </div>
      <h5>상품 전체 보기 페이지 입니다.</h5>
      {/* 로딩 중이면 로딩 메시지 표시 */}
      {isLoading ? (
        <p>🔄 로딩 중...</p>
      ) : orderedItems.length > 0 ? (
        orderedItems.map((item, i) => (
          <div key={i}>
            <ItemListItem itemInfo={item} />
          </div>
        ))
      ) : (
        <p>해당 카테고리에 상품이 없습니다.</p>
      )}
    </>
  );
}

export default ItemList;
