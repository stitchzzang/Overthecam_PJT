import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import BattleListItem from "../../components/BattleRoom/BattleListItem";

function BattleMainPage() {
  const [battles, setBattles] = useState([
    {
      id: 1234,
      battleId: 21,
      BattleName: "깻잎 논쟁",
    },
    {
      id: 2345,
      battleId: 22,
      BattleName: "피자 vs 치킨",
    },
  ]);
  
  // 페이지네이션 용
  // 현재 페이지
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState(battles);
  // 한 페이지당 8개 보여준다
  const itemsPerPage = 1;
  // slice할 index범위
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    setCurrentList(battles.slice(indexOfFirstItem, indexOfLastItem));
  }, [page, battles]);

  const changePageHandler = (page) => {
    setPage(page);
  };

  return (
    <>
      <Link to={"/create-battle-room"}>방만들기</Link>
      <div>
        {/* 타이틀 섹션 */}
        <h1>Battle Main Page</h1>
      </div>
      <div>
        {/* 배틀 목록 컴포넌트 생성 */}
        {currentList.map((post) => (
          <BattleListItem
            key={post.id}
            battleId={post.battleId}
            BattleName={post.BattleName}
          />
        ))}
      </div>
      <Pagination
        activePage={page}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={battles.length}
        pageRangeDisplayed={5}
        prevPageText={"이전"}
        nextPageText={"다음"}
        onChange={changePageHandler}
      />
    </>
  );
}

export default BattleMainPage;
