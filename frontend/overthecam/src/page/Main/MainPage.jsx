import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion } from "framer-motion"; // 메인 Framer motion 추가
// import Joyride from 'react-joyride'; // 코치마크를 위한 import - 추후 구현 예정

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
  const navigate = useNavigate();  // 네비게이션 추가
  // const [runTour, setRunTour] = useState(true); // 코치마크 상태 - 추후 구현 예정

  // 코치마크 단계 정의 - 추후 구현 예정
  /*
  const steps = [
    {
      target: '.battle-section',
      content: '여기서 진행중인 배틀을 확인할 수 있어요!',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.status-badge',
      content: '배틀에 참여하려면 이 버튼을 클릭하세요.',
      placement: 'left',
    },
    {
      target: '.vote-section',
      content: '투표에 참여하고 우승자를 선택해보세요!',
      placement: 'top',
    }
  ];
  */

  useEffect(() => {
    // 코치마크 관련 코드 - 추후 구현 예정
    /*
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    if (isFirstVisit) {
      setRunTour(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    */
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      // 토큰 없이 요청하도록 수정
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/battle/room/all`);
      
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

  // 배틀룸 입장 처리 함수
  const handleBattleEnter = (battleId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 로그인이 필요하다는 알림
      alert('로그인이 필요한 서비스입니다.');
      navigate('/main/login');
      return;
    }
    // 로그인된 상태면 배틀룸으로 이동
    navigate(`/main/battle-room/${battleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 코치마크 컴포넌트 - 추후 구현 예정
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        hideCloseButton={true}
        spotlightClicks={true}
        styles={{
          options: {
            primaryColor: '#4A90E2',
            zIndex: 10000,
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
          tooltipContainer: {
            textAlign: 'center',
          },
          buttonNext: {
            backgroundColor: '#4A90E2',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
        locale={{
          back: '이전',
          close: '닫기',
          last: '완료',
          next: '다음',
          skip: '건너뛰기'
        }}
        callback={(data) => {
          const { status, type } = data;
          if (['finished', 'skipped'].includes(status)) {
            setRunTour(false);
          }
        }}
      />
      */}

      <div className="relative">
        {/* 그라데이션 배경 */}
        <div className="bg-gradient-to-r from-cusPink to-cusLightBlue h-56" />
        
        <div className="container mx-auto px-4">
          <div className="container mx-auto p-14">
            {/* Battle Section */}
            <motion.section 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{
                ease: 'easeInOut',
                duration: 2,
                x: { duration: 1 },
              }}
              className="flex flex-col mb-12 battle-section"
            >
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
                              <div 
                                onClick={() => handleBattleEnter(battle.battleId)}
                                className="hover:scale-105 transition-transform cursor-pointer"
                              >
                                <StatusBadge status={battle.status} />
                              </div>
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
            </motion.section>

            {/* 메인 Framer motion 추가 */}
            <motion.section 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{
                ease: 'easeInOut',
                duration: 2,
                x: { duration: 2 },
              }}
              className="flex flex-col mb-12 vote-section"
            >
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
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
