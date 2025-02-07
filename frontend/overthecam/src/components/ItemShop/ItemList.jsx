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
    <div className="item-list">
      <div className="flex felx-col justify-center">
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
      <div className="flex felx-col justify-center">
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
      <div className="h-screen overflow-y-auto">
        {/* 로딩 중이면 로딩 메시지 표시 */}
        {isLoading ? (
          <div className="p-6 m-6 flex justify-center items-center space-x-3">
            {/* 스피너 */}
            <div className="loading"></div>
            {/* 로딩 중 글씨 */}
            <p className="text-xl font-semibold text-cusBlue dark:text-white drop-shadow-lg">
              로딩 중...
            </p>
          </div>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {currentList.map((item, i) => (
              <div key={i}>
                <ItemListItem itemInfo={item} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl font-semibold text-cusBlue dark:text-white drop-shadow-lg">
            해당 카테고리에 상품이 없습니다.
          </p>
        )}
      </div>
      <div className="flex justify-center pb-10">
        <Pagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={filteredItems.length}
          pageRangeDisplayed={5}
          prevPageText={"이전"}
          nextPageText={"다음"}
          onChange={changePageHandler}
          innerClass="flex gap-2"
          itemClass="px-4 py-2 rounded-lg text-cusBlack-light hover:bg-gray-300 transition"
          activeClass="bg-cusBlack-light !text-white"
          linkClass="block w-full h-full text-center"
        />
      </div>
    </div>
  );
}

export default ItemList;
