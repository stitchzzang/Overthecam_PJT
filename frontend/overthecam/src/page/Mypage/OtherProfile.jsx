import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { authAxios } from "../../common/axiosinstance"

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
  const [userData, setUserData] = useState(null)
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center">
          {/* 프로필 이미지 */}
          <div className="relative mb-6">
            {userData.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt="프로필" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-4xl text-gray-600">
                  {userData.nickname.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* 사용자 정보 */}
          <h2 className="text-2xl font-bold mb-4">{userData.nickname}</h2>
          
          {/* 팔로워/팔로잉 카운트 */}
          <div className="flex gap-8 mb-6">
            <div 
              onClick={() => handleOpenModal('follower')}
              className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
            >
              <div className="text-xl font-semibold">{counts.followers}</div>
              <div className="text-gray-600">팔로워</div>
            </div>
            <div 
              onClick={() => handleOpenModal('following')}
              className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
            >
              <div className="text-xl font-semibold">{counts.following}</div>
              <div className="text-gray-600">팔로잉</div>
            </div>
          </div>

          {/* 팔로우 버튼 */}
          <button 
            onClick={handleFollowToggle}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              isFollowing 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? '언팔로우' : '팔로우'}
          </button>
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