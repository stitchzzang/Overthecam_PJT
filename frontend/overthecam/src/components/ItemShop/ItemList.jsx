import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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

  const handleSelect = (value) => {
    setOrder(value);
    setPage(1);
  };

  return (
    <div className="bg-cusGray-light m-5 rounded-2xl p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-cusBlack-light">
          아이템 상점
        </h1>
      </div>
      <div className="bg-white rounded-2xl p-4 pt-10 clay">
        {/* Filter and Sort Section */}
        <div className="flex justify-between items-center">
          {/* Category Tabs */}
          <div className="w-2/3 flex gap-1">
            {[
              { id: "all", label: "전체" },
              { id: "FRAME", label: "프레임" },
              { id: "EFFECT", label: "효과음" },
              { id: "MASK", label: "가면" },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setFilter(category.id);
                  setPage(1);
                }}
                className={`
                  flex-1 min-w-24 px-6 py-2 rounded-tl-xl rounded-tr-xl rounded-b-none font-semibold transition-all duration-300
                  ${
                    filter === category.id
                      ? "bg-cusGray-light text-cusBlack-light"
                      : "bg-cusGray text-cusBlack-light hover:bg-cusLightBlue"
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSelect(0)}
              className={`
          px-4 py-2 rounded-lg text-sm font-medium
          ${
            order === 0
              ? "bg-cusPink-light text-gray-700"
              : "bg-cusGray text-gray-700 hover:bg-gray-200"
          }
        `}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-3 h-3 rounded-full border ${
                    order === 0
                      ? "border-white bg-white"
                      : "border-gray-400 bg-transparent"
                  }`}
                />
                포인트 낮은 순
              </div>
            </button>

            <button
              onClick={() => handleSelect(1)}
              className={`
          px-4 py-2 rounded-lg text-sm font-medium
          ${
            order === 1
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-3 h-3 rounded-full border ${
                    order === 1
                      ? "border-white bg-white"
                      : "border-gray-400 bg-transparent"
                  }`}
                />
                포인트 높은 순
              </div>
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="bg-cusGray-light rounded-2xl p-6 shadow-lg clay min-h-[600px]">
          {isLoading ? (
            <div className="flex justify-center items-center space-x-3 h-full">
              <div className="loading"></div>
              <p className="text-xl font-semibold text-cusBlue drop-shadow-lg">
                로딩 중...
              </p>
            </div>
          ) : currentList.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {currentList.map((item, i) => (
                <div key={i}>
                  <ItemListItem itemInfo={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl font-semibold text-cusBlack drop-shadow-lg">
                해당 카테고리에 상품이 없습니다.
              </p>
            </div>
          )}
          {/* Pagination */}
          <div className="flex justify-center p-4 mt-2">
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
      </div>
    </div>
  );
}

export default ItemList;
