import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from '../../common/axiosinstance';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

const MainPage = () => {
  const [battleList, setBattleList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchBattles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token 
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await publicAxios.get('/battle/room/all', { headers });
      
      if (response.data.success) {
        const battles = response.data.data.battleInfo.map(battle => ({
          ...battle,
          status: typeof battle.status === 'string' 
            ? battle.status === "WAITING" ? 0 : 1
            : battle.status
        }));
        setBattleList(battles);
      }
    } catch (error) {
      console.error("배틀 목록 조회 중 오류 발생:", error);
      setBattleList([]);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(battleList.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(battleList.length / 3)) % Math.ceil(battleList.length / 3));
  };

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000); // 5초마다 다음 슬라이드
    return () => clearInterval(timer);
  }, [battleList.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        <div className="container mx-auto px-4">
          {/* 캐러셀 섹션 */}
          <div className="relative -mt-20 mb-12">
            <div className="carousel relative overflow-hidden rounded-lg bg-white shadow-xl p-6">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {battleList.map((battle, index) => (
                  <div key={battle.battleId} className="w-1/3 flex-shrink-0 px-2">
                    <Link to={`/battle/${battle.battleId}`}>
                      <div className="clay bg-white rounded-lg p-4 hover:scale-105 transition-transform">
                        <img 
                          src={battle.thumbnailUrl} 
                          alt={battle.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{battle.title}</h3>
                        <div className="flex justify-between items-center">
                          <StatusBadge status={battle.status} />
                          <span className="text-cusBlue font-bold">
                            {battle.totalUsers} / 6
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 기존 Battle, Vote 섹션 유지 */}
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
                    <Link 
                      to={`/battle/${battle.battleId}`} 
                      key={`battle-${battle.battleId}`}
                      className="block"
                    >
                      <div className="clay p-4 bg-white h-32 hover:scale-105">
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
                          <div className="flex flex-col flex-grow">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
                              {battle.title}
                            </h3>
                            <StatusBadge status={battle.status} />
                            <div className="flex-grow" />
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium">참가자:</span>
                              <span className="ml-2 text-cusBlue font-bold">
                                {battle.totalUsers} / 6
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battleList.length > 0 ? (
                  battleList.map((battle) => (
                    <div key={`vote-${battle.id}`} className="p-4 bg-white rounded-lg shadow h-32">
                      {battle.title}
                    </div>
                  ))
                ) : (
                  [...Array(6)].map((_, index) => (
                    <Card key={`vote-${index}`} />
                  ))
                )}
              </div>
            </section>

            {/* User Section - 검색할 때만 표시 */}
            {battleList.length > 0 && (
              <section className="flex flex-col mb-12">
                <div className="flex justify-between items-center">
                  <SectionTitle title="User" />
                  <Link
                    to="/users"
                    className="text-cusBlue text-xl font-medium justify-end mr-5"
                  >
                    + More
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {battleList.map((user) => (
                    <div 
                      key={`user-${user.id}`} 
                      className="p-4 bg-white rounded-lg shadow flex items-center gap-4 h-32"
                    >
                      <img 
                        src={user.profileImage} 
                        alt={user.nickname} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.nickname}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
