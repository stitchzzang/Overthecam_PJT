import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-js-pagination";
import BattleListItem from "../../components/BattleRoom/BattleListItem";
import { readRooms } from "../../service/BattleRoom/api";

function BattleMainPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [battles, setBattles] = useState([]);

  // 로그인 체크 추가
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/main/login');
      return;
    }
  }, [navigate]);

  // 화면 렌더링 시 메인 페이지 read
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // 토큰이 없으면 API 호출하지 않음

        const response = await readRooms();
        console.log("API 응답:", response.data.battleInfo);
        setBattles(
          Array.isArray(response.data.battleInfo)
            ? response.data.battleInfo
            : []
        );
        setIsLoading(false);
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
        if (error.response?.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/main/login');
        }
      }
    };

    fetchData();

    return () => {
      setBattles([]);
    };
  }, [navigate]);

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
      <div className="battle-main-page">
        <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue p-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
            배틀방 목록 보기
          </h1>
        </div>
        {isLoading ? (
          <div className="p-6 m-6 flex justify-center items-center space-x-3">
            {/* 스피너 */}
            <div className="loading"></div>
            {/* 로딩 중 글씨 */}
            <p className="text-xl font-semibold text-cusBlue dark:text-white drop-shadow-lg">
              로딩 중...
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 m-2 sm:m-6 justify-center">
            {battles.length === 0 ? (
              <p className="text-xl font-semibold text-cusBlue dark:text-white drop-shadow-lg">
                현재 배틀 진행 중인 방이 없습니다.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
                  {currentList.map((room) => (
                    <BattleListItem
                      key={room.battleId}
                      title={room.title}
                      totalUsers={room.totalUsers}
                      thumbnail={room.thumbnailUrl}
                      status={room.status}
                      battleId={room.battleId}
                    />
                  ))}
                </div>
                {/* 페이지네이션 */}
                <div className="flex justify-center pb-10">
                  <Pagination
                    activePage={page}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={battles?.length || 0}
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
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default BattleMainPage;
