import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-32">{children}</div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-4 pl-8 text-start justify-start">
    {title}
  </h2>
);

const StatusBadge = ({ status }) => {
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold";
  return status === 0 ? (
    <span className={`${baseClasses} bg-cusRed-light text-cusBlack`}>
      입장하기
    </span>
  ) : (
    <span className={`${baseClasses} bg-cusBlue-light text-cusBlack`}>
      진행 중
    </span>
  );
};

// 참가자 수를 위한 새로운 컴포넌트
const ParticipantsBadge = ({ current, max }) => {
  const baseClasses = "btn px-4 py-1.5 text-sm font-bold pointer-events-none";
  return (
    <span className={`${baseClasses} bg-cusGray-light text-cusBlack`}>
      {current} / {max}
    </span>
  );
};

const MainPage = () => {
  const [battleList, setBattleList] = useState([]);

  const fetchBattles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token 
        ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        : {
            'Content-Type': 'application/json'
          };

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/battle/room/all`, { headers });
      
      if (response.data.success) {
        const battles = response.data.data.battleInfo.map(battle => ({
          ...battle,
          status: typeof battle.status === 'string' 
            ? battle.status === "WAITING" ? 0 : 1
            : battle.status
        }));
        setBattleList(battles.slice(0, 6));
      } else {
        console.error("배틀 목록 조회 실패:", response.data.error);
        setBattleList([]);
      }
    } catch (error) {
      console.error("배틀 목록 조회 중 오류 발생:", error);
      setBattleList([]);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        <div className="container mx-auto px-4">
          <div className="container mx-auto p-14">
            {/* Battle Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Battle" />
                <Link
                  to="/battle-list"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + More
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battleList.length > 0 ? (
                  battleList.map((battle) => (
                    <div 
                      key={`battle-${battle.battleId}`}
                      className="block"
                    >
                      <div className="clay p-4 bg-white h-32 hover:scale-105 transition-transform">
                        <div className="flex h-full gap-4">
                          {/* 썸네일 이미지 */}
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={battle.thumbnailUrl} 
                              alt={battle.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* 내용 */}
                          <div className="flex flex-col justify-center flex-grow h-full">
                            {/* 제목 */}
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-3">
                              {battle.title}
                            </h3>
                            
                            {/* 상태와 참가자 정보 */}
                            <div className="flex justify-center items-center gap-2">
                              <ParticipantsBadge current={battle.totalUsers} max={6} />
                              <Link to={`/battle/${battle.battleId}`} className="hover:scale-105 transition-transform">
                                <StatusBadge status={battle.status} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  [...Array(6)].map((_, index) => (
                    <Card key={`battle-${index}`} />
                  ))
                )}
              </div>
            </section>

            {/* Vote Section */}
            <section className="flex flex-col mb-12">
              <div className="flex justify-between items-center">
                <SectionTitle title="Vote" />
                <Link
                  to="/vote"
                  className="text-cusBlue text-xl font-medium justify-end mr-5"
                >
                  + More
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <Card key={`vote-${index}`} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
