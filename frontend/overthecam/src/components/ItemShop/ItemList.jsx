import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import ItemListItem from "./ItemListItem";
import { getItem } from "../../service/ItemShop/api";

function ItemList() {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // 전체보기
  const [order, setOrder] = useState(0); // 포인트 낮은 순서
  const [Items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState(Items);
  const [currentList, setCurrentList] = useState(Items);
  // 한 페이지당 8개 보여준다
  const itemsPerPage = 8;
  // slice할 index범위
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    setIsLoading(true);
    // axios 요청
    getItem()
      .then((res) => {
        setItems(res.data);
        console.log("데이터 불러오기 성공", res.data);
      })
      .catch((error) => {
        console.log("데이터 불러오기 실패", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // 필터링
    const filteredItems =
      filter === "all" ? Items : Items.filter((item) => item.type === filter);

    setFilteredItems(filteredItems); // 필터링된 항목을 상태에 저장
  }, [Items, filter]); // Items나 filter가 변경될 때마다 실행

  useEffect(() => {
    const filteredItems =
      filter === "all" ? Items : Items.filter((item) => item.type === filter);

    const orderedItems = [...filteredItems].sort((a, b) =>
      order === 0 ? a.price - b.price : b.price - a.price
    );
    setCurrentList(orderedItems.slice(indexOfFirstItem, indexOfLastItem));
  }, [Items, filter, order, page]);

  const changePageHandler = (page) => {
    setPage(page);
  };

  return (
    <>
      <div>
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
        >
          전체보기
        </button>
        <button
          onClick={() => {
          setFilter("FRAME");
            setPage(1);
          }}
        >
          프레임
        </button>
        <button
          onClick={() => {
            setFilter("EFFECT");
            setPage(1);
          }}
        >
          효과음
        </button>
        <button
          onClick={() => {
            setFilter("MASK");
            setPage(1);
          }}
        >
          가면
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            setOrder(0);
            setPage(1);
          }}
        >
          포인트 낮은 순
        </button>
        <button
          onClick={() => {
            setOrder(1);
            setPage(1);
          }}
        >
          포인트 높은 순
        </button>
      </div>
      <h5>상품 전체 보기 페이지 입니다.</h5>
      {/* 로딩 중이면 로딩 메시지 표시 */}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : currentList.length > 0 ? (
        currentList.map((item, i) => (
          <div key={i}>
            <ItemListItem itemInfo={item} />
          </div>
        ))
      ) : (
        <p>해당 카테고리에 상품이 없습니다.</p>
      )}
      <Pagination
        activePage={page}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={filteredItems.length}
        pageRangeDisplayed={5}
        prevPageText={"이전"}
        nextPageText={"다음"}
        onChange={changePageHandler}
      />
    </>
  );
}

export default ItemList;
