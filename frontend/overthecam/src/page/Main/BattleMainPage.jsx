import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import BattleListItem from "../../components/BattleRoom/BattleListItem";
import { readRooms } from "../../service/BattleRoom/api";

function BattleMainPage() {
  const [battles, setBattles] = useState([]);

  // 화면 렌더링 시 메인 페이지 read
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await readRooms();
        console.log("API 응답:", response.data.battleInfo);
        setBattles(
          Array.isArray(response.data.battleInfo)
            ? response.data.battleInfo
            : []
        );
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      }
    };

    fetchData();

    return () => {
      setBattles([]);
    };
  }, []);

  // 페이지네이션 용
  // 현재 페이지
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  // 한 페이지당 8개 보여준다
  const itemsPerPage = 8;
  // slice할 index범위
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    if (Array.isArray(battles)) {
      setCurrentList(battles.slice(indexOfFirstItem, indexOfLastItem));
    } else {
      setCurrentList([]); // 배열이 아니면 빈 배열 설정
    }
  }, [page, battles]);

  const changePageHandler = (page) => {
    setPage(page);
  };

  return (
    <>
      <div className="battle-main-page ">
        <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue pt-6 pl-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
            배틀방 목록 보기
          </h1>
        </div>
        <div className="flex justify-end m-6">
          <div className="mx-10">
            <Link
              to={"/create-battle-room"}
              className="btn px-6 py-2 bg-btnPink text-btnPink-hover rounded-full hover:bg-btnPink-hover hover:text-btnPink text-center"
            >
              방 만들기
            </Link>
          </div>
        </div>
        <div className="p-6 m-6 justify-center">
          <div className="grid grid-cols-2 gap-4">
            {/* 배틀 목록 컴포넌트 생성 */}
            {currentList.map((room) => (
              <BattleListItem
                key={room.title}
                title={room.title}
                totalUsers={room.totalUsers}
                thumbnail={room.thumbnailUrl}
                status={room.status}
                battleId={room.battleId}
              />
            ))}
          </div>
        </div>
        <Pagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={battles?.length || 0}
          pageRangeDisplayed={5}
          prevPageText={"이전"}
          nextPageText={"다음"}
          onChange={changePageHandler}
        />
      </div>
    </>
  );
}

export default BattleMainPage;
