import { useState, useEffect, useRef } from "react";
import Pagination from "react-js-pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ItemListItem from "./ItemListItem";
import { getItem } from "../../service/ItemShop/api";
import { authAxios } from "../../common/axiosinstance";
import SuccessAlertModal from "../@common/SuccessAlertModal";  // 경로 수정

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
  const [purchasedItems, setPurchasedItems] = useState(new Set());
  const [myPoints, setMyPoints] = useState(0);
  const [myCheerScore, setMyCheerScore] = useState(0);
  const successAlertRef = useRef();

  useEffect(() => {
    setIsLoading(true);
    // axios 요청
    getItem()
      .then((res) => {
        setItems(res);
        console.log("상점 아이템 데이터:", res);
        console.log("첫 번째 아이템:", res[0]);
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

  // 내 아이템 목록 가져오기
  const fetchMyItems = async () => {
    try {
      const response = await authAxios.get('/store/item/my/all');  // API 경로 수정
      if (response.data) {  // data.data 확인
        const purchasedItemIds = new Set(
          response.data.map(item => item.storeItemId)
        );
        setPurchasedItems(purchasedItemIds);
      }
    } catch (error) {
      // 구매한 상품이 없는 경우는 정상적인 상황으로 처리
      if (error.response?.data?.code === 'STORE_ITEM_NOT_PURCHASE') {
        setPurchasedItems(new Set());
      } else {
        console.error('내 아이템 목록 로드 실패:', error);
      }
    }
  };

  // 포인트와 응원점수 가져오기
  const fetchUserStats = async () => {
    try {
      const response = await authAxios.get('/mypage/stats');
      if (response.data) {  // data 체크 추가
        const { scoreInfo } = response.data;
        if (scoreInfo) {
          setMyPoints(scoreInfo.point);
          setMyCheerScore(scoreInfo.supportScore);
          console.log('포인트 업데이트:', scoreInfo.point); // 디버깅용
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  const handlePurchaseSuccess = async (itemId, price) => {
    try {
      // 즉시 포인트 차감 및 구매 목록 업데이트
      setMyPoints(prev => prev - price);
      setPurchasedItems(prev => new Set([...prev, itemId]));
      
      successAlertRef.current?.showModal("아이템 구매에 성공했습니다!");
      
      // 페이지 새로고침
      window.location.reload();
      
    } catch (error) {
      console.error('구매 후 데이터 업데이트 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    Promise.all([
      fetchMyItems(),
      fetchUserStats()
    ]);
  }, []);

  return (
    <div className="bg-cusGray-light m-5 rounded-2xl p-6">
      <SuccessAlertModal ref={successAlertRef} />
      
      {/* Header Section */}
      <div className="flex justify-between items-center m-3">
        <h1 className="text-2xl font-extrabold text-cusBlack-light">
          아이템 상점
        </h1>
        <div className="flex gap-4">
          <span className="font-semibold">보유 포인트: {myPoints.toLocaleString()}</span>
          <span className="font-semibold">응원점수: {myCheerScore.toLocaleString()}</span>
        </div>
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
              {currentList.map((item) => (
                <div key={item.storeItemId}>
                  <ItemListItem 
                    itemInfo={item} 
                    isPurchased={purchasedItems.has(item.storeItemId)}
                    onPurchaseSuccess={(itemId, price) => handlePurchaseSuccess(itemId, price)}
                    myPoints={myPoints}
                  />
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
