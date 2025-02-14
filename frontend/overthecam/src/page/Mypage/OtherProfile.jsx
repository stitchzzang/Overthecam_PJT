import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { authAxios } from "../../common/axiosinstance"
import MyPageBattle from './MyPageBattle'
import MyPageVote from './MyPageVote'

// 팔로워/팔로잉 모달 컴포넌트
const FollowModal = ({ isOpen, onClose, title, users, onFollowToggle, currentUserFollowing }) => {
  const navigate = useNavigate();  // useNavigate 훅 추가

  if (!isOpen) return null;

  // 유저 프로필로 이동하는 함수
  const handleUserClick = (userId) => {
    onClose();  // 모달 닫기
    navigate(`/profile/${userId}`);  // 해당 유저의 프로필 페이지로 이동
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold text-center">{title}</h3>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {users.length > 0 ? (
            users.map((user) => (
              <div 
                key={user.userId} 
                className="p-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleUserClick(user.userId)}  // 클릭 이벤트 추가
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.nickname} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg text-gray-500">
                        {user.nickname.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-gray-800">{user.nickname}</span>
                </div>
                {user.userId !== Number(localStorage.getItem('userId')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();  // 상위 요소로의 이벤트 전파 방지
                      onFollowToggle(user.userId);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      currentUserFollowing.includes(user.userId)
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {currentUserFollowing.includes(user.userId) ? '언팔로우' : '팔로우'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              목록이 비어있습니다
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

function OtherProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('vote')
  const [userData, setUserData] = useState({
    userId: Number(id),
    nickname: "알 수 없는 사용자",
    profileImage: null,
    battleStats: {
      totalGames: 0,
      win: 0,
      draw: 0,
      loss: 0,
      winRate: 0
    }
  })
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [modalType, setModalType] = useState(null); // 'followers' or 'following'
  const [modalUsers, setModalUsers] = useState([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 로그인 체크 - userInfo에서 userId 확인
        const userInfoStr = localStorage.getItem('userInfo')
        console.log("저장된 userInfo:", userInfoStr)
        
        if (!userInfoStr) {
          console.log("로그인 정보 없음")
          navigate('/login')
          return
        }

        const userInfo = JSON.parse(userInfoStr)
        console.log("파싱된 userInfo:", userInfo)

        if (!userInfo || !userInfo.userId) {
          console.log("유효하지 않은 사용자 정보")
          navigate('/login')
          return
        }

        // 내 프로필인 경우 마이페이지로 이동
        if (Number(userInfo.userId) === Number(id)) {
          console.log("내 프로필로 이동")
          navigate('/mypage')
          return
        }

        await fetchUserData()
      } catch (error) {
        console.error("데이터 조회 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [id, navigate])

  // 유저 정보 가져오기
  const fetchUserData = async () => {
    try {
      // 직접 해당 유저의 정보를 가져오기
      const userResponse = await authAxios.get(`/mypage/stats?userId=${id}`);
      console.log("유저 정보 응답:", userResponse);

      if (userResponse.success) {
        const myPageData = userResponse.data;
        
        // 유저 정보 설정
        setUserData({
          userId: myPageData.profileInfo.userId,
          nickname: myPageData.profileInfo.nickname,
          profileImage: myPageData.profileInfo.profileImage,
          battleStats: myPageData.battleStats
        });

        // 팔로워/팔로잉 수 설정
        setCounts({
          followers: myPageData.followStats.followerCount,
          following: myPageData.followStats.followingCount
        });

        // 팔로우 여부 설정
        setIsFollowing(myPageData.profileInfo.follow);

      } else {
        throw new Error("유저 정보를 가져오는데 실패했습니다.");
      }

    } catch (error) {
      console.error("데이터 조회 실패:", error);
      setUserData({
        userId: Number(id),
        nickname: "알 수 없는 사용자",
        profileImage: null,
        battleStats: {
          totalGames: 0,
          win: 0,
          draw: 0,
          loss: 0,
          winRate: 0
        }
      });
      setIsFollowing(false);
      setCounts({ followers: 0, following: 0 });
    }
  };

  // 모달 열기
  const handleOpenModal = async (type) => {
    try {
      // 현재 프로필 유저의 팔로워/팔로잉 목록 가져오기
      const response = await authAxios.get(`/member/${type}?userId=${id}`);
      console.log(`${type} 목록:`, response);
      
      if (response.success) {
        setModalUsers(response.data || []);
        setModalType(type);
        
        // 현재 로그인한 사용자의 팔로잉 목록 가져오기
        const followingResponse = await authAxios.get('/member/following');
        if (followingResponse.success) {
          setCurrentUserFollowing(followingResponse.data?.map(user => user.userId) || []);
        }
      }
    } catch (error) {
      console.error(`${type} 목록 조회 실패:`, error);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalType(null)
    setModalUsers([])
  }

  // 모달 내에서 팔로우/언팔로우
  const handleModalFollowToggle = async (targetId) => {
    try {
      if (currentUserFollowing.includes(targetId)) {
        // 언팔로우
        const response = await authAxios.delete(`/member/follow/${targetId}`);
        if (response.success) {
          setCurrentUserFollowing(prev => prev.filter(id => id !== targetId));
          // 현재 모달 타입이 follower인 경우에만 모달 유저 목록 업데이트
          if (modalType === 'follower') {
            setModalUsers(prev => prev.map(user => ({
              ...user,
              isFollowing: user.userId === targetId ? false : user.isFollowing
            })));
          }
        }
      } else {
        // 팔로우
        const response = await authAxios.post(`/member/follow/${targetId}`);
        if (response.success) {
          setCurrentUserFollowing(prev => [...prev, targetId]);
          // 현재 모달 타입이 follower인 경우에만 모달 유저 목록 업데이트
          if (modalType === 'follower') {
            setModalUsers(prev => prev.map(user => ({
              ...user,
              isFollowing: user.userId === targetId ? true : user.isFollowing
            })));
          }
        }
      }
      // 메인 데이터 새로고침
      await fetchUserData();
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
      let errorMessage = "팔로우/언팔로우 요청이 실패했습니다.";
      if (error.error) {
        switch (error.error.code) {
          case 'SELF_FOLLOW_NOT_ALLOWED':
            errorMessage = "자기 자신을 팔로우할 수 없습니다.";
            break;
          case 'ALREADY_FOLLOWING':
            errorMessage = "이미 팔로우한 사용자입니다.";
            break;
          case 'FOLLOW_NOT_FOUND':
            errorMessage = "팔로우 관계가 존재하지 않습니다.";
            break;
        }
      }
      alert(errorMessage);
    }
  };

  // 메인 프로필의 팔로우/언팔로우 처리
  const handleFollowToggle = async () => {
    if (!userData) return;

    try {
      const targetId = userData.userId;
      
      if (isFollowing) {
        // 언팔로우
        const response = await authAxios.delete(`/member/follow/${targetId}`);
        if (response.success) {
          setIsFollowing(false);
          // 현재 프로필의 팔로워 수 감소
          setCounts(prev => ({
            ...prev,
            followers: Math.max(0, prev.followers - 1)
          }));
          // 현재 유저의 팔로잉 목록에서 제거
          setCurrentUserFollowing(prev => prev.filter(id => id !== targetId));
        }
      } else {
        // 팔로우
        const response = await authAxios.post(`/member/follow/${targetId}`);
        if (response.success) {
          setIsFollowing(true);
          // 현재 프로필의 팔로워 수 증가
          setCounts(prev => ({
            ...prev,
            followers: prev.followers + 1
          }));
          // 현재 유저의 팔로잉 목록에 추가
          setCurrentUserFollowing(prev => [...prev, targetId]);
        }
      }
      // 데이터 새로고침
      await fetchUserData();
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
      let errorMessage = "팔로우/언팔로우 요청이 실패했습니다.";
      if (error.error) {
        switch (error.error.code) {
          case 'SELF_FOLLOW_NOT_ALLOWED':
            errorMessage = "자기 자신을 팔로우할 수 없습니다.";
            break;
          case 'ALREADY_FOLLOWING':
            errorMessage = "이미 팔로우한 사용자입니다.";
            break;
          case 'FOLLOW_NOT_FOUND':
            errorMessage = "팔로우 관계가 존재하지 않습니다.";
            break;
        }
      }
      alert(errorMessage);
    }
  };

  if (isLoading) return <div>로딩중...</div>
  if (!userData) return <div>사용자를 찾을 수 없습니다.</div>

  return (
    <div className="min-h-screen bg-cusGray-light">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="w-full md:w-72">
            <div className="bg-white rounded-lg p-6 clay">
              {userData.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="w-full aspect-square rounded-lg object-cover"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-cusGray flex items-center justify-center">
                  <span className="text-4xl text-cusGray-dark">
                    {userData.nickname?.charAt(0)}
                  </span>
                </div>
              )}
              <button 
                onClick={handleFollowToggle}
                className={`w-full py-2 rounded-lg font-medium mt-4 transition-colors ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-cusBlue text-white hover:bg-cusBlue-dark'
                }`}
              >
                {isFollowing ? '언팔로우' : '팔로우'}
              </button>
            </div>
          </div>

          {/* User Info & Stats */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-lg p-6 clay">
              <h2 className="text-xl font-bold mb-4">{userData.nickname}</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className="bg-cusLightBlue-lighter p-4 rounded-lg clay cursor-pointer hover:bg-cusLightBlue-light transition-colors"
                  onClick={() => handleOpenModal('follower')}
                >
                  <p className="text-sm text-gray-600">팔로워</p>
                  <p className="text-2xl font-bold">{counts.followers}</p>
                </div>
                <div 
                  className="bg-cusLightBlue-lighter p-4 rounded-lg clay cursor-pointer hover:bg-cusLightBlue-light transition-colors"
                  onClick={() => handleOpenModal('following')}
                >
                  <p className="text-sm text-gray-600">팔로잉</p>
                  <p className="text-2xl font-bold">{counts.following}</p>
                </div>
              </div>

              {/* Battle Record */}
              <div className="bg-gray-50 p-4 rounded-lg clay">
                <h3 className="text-lg font-semibold mb-4">내 전적 보기</h3>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-cusLightBlue-lighter flex items-center justify-center mb-2 clay">
                      <span className="text-blue-600 text-xl font-bold">{userData.battleStats?.win || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">승</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 clay">
                      <span className="text-gray-600 text-xl font-bold">{userData.battleStats?.draw || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">무</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2 clay">
                      <span className="text-red-500 text-xl font-bold">{userData.battleStats?.loss || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">패</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {userData.nickname} 님의 승률은 {userData.battleStats?.winRate || 0}% 입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 UI */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'battle' 
                  ? 'text-cusBlue border-b-2 border-cusBlue' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('battle')}
            >
              배틀 관리
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'vote' 
                  ? 'text-cusBlue border-b-2 border-cusBlue' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('vote')}
            >
              투표 관리
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'battle' && <MyPageBattle userId={id} />}
            {activeTab === 'vote' && <MyPageVote userId={id} isOtherProfile={true} />}
          </div>
        </div>
      </div>

      {/* 팔로워/팔로잉 모달 */}
      <FollowModal
        isOpen={modalType !== null}
        onClose={handleCloseModal}
        title={modalType === 'follower' ? '팔로워' : '팔로잉'}
        users={modalUsers}
        onFollowToggle={handleModalFollowToggle}
        currentUserFollowing={currentUserFollowing}
      />
    </div>
  )
}

export default OtherProfile 