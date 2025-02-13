"use client"

import { useState, useRef, useEffect } from "react"
import NavBar from "../../components/Layout/NavBar"
import { authAxios } from "../../common/axiosinstance"
import MyPageReport from './MyPageReport'
import MyPageBattle from './MyPageBattle'
import MyPageVote from './MyPageVote'
import { useLocation, useNavigate } from 'react-router-dom';

// 팔로워/팔로잉 모달 컴포넌트
const FollowModal = ({ isOpen, onClose, title, users, onFollowToggle, currentUserFollowing }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/otherprofile/${userId}`);
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
                  onClick={() => handleUserClick(user.userId)}
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
                      e.stopPropagation();
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

function MyPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'vote');

  const [userData, setUserData] = useState({
    id: "",
    password: "",
    name: "",
    nickname: "",
    birthDate: "",
    email: "",
    gender: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    stats: {
      cheerPoints: 0,
      points: 0,
      followers: 0,
      following: 0,
      record: {
        wins: 0,
        draws: 0,
        losses: 0,
      },
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({ ...userData })
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState({ show: false, message: '', type: null })
  const [modalType, setModalType] = useState(null);
  const [modalUsers, setModalUsers] = useState([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        // API를 통해 마이페이지 정보 가져오기
        const response = await authAxios.get("/mypage/stats");
        const myPageData = response;
        
        setUserData({
          id: userInfo.userId || "",
          email: userInfo.email || "",
          username: userInfo.username || "",
          nickname: myPageData.data.profileInfo?.nickname || "",
          gender: userInfo.gender || "",
          birth: userInfo.birth || "",
          phoneNumber: userInfo.phoneNumber || "",
          profileInfo: {
            profileImage: myPageData.data.profileInfo?.profileImage
          },
          stats: {
            cheerPoints: myPageData.data.scoreInfo?.supportScore || 0,
            points: myPageData.data.scoreInfo?.point || 0,
            followers: myPageData.data.followStats?.followerCount || 0,
            following: myPageData.data.followStats?.followingCount || 0,
          },
          battleStats: {
            totalGames: myPageData.data.battleStats?.totalGames || 0,
            win: myPageData.data.battleStats?.win || 0,
            draw: myPageData.data.battleStats?.draw || 0,
            loss: myPageData.data.battleStats?.loss || 0,
            winRate: myPageData.data.battleStats?.winRate || 0
          }
        });

        setEditedData({
          password: "",
          username: userInfo.username || "",
          nickname: myPageData.data.profileInfo?.nickname || "",
          phoneNumber: userInfo.phoneNumber || ""
        });

      } catch (error) {
        console.error("Failed to load user data:", error);
        setToast({ show: true, message: '사용자 정보를 불러오는데 실패했습니다', type: 'error' });
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await authAxios.put("/members/me", editedData)
      setUserData({ ...userData, ...editedData })
      setIsEditing(false)
      setToast({ show: true, message: 'User data updated successfully', type: 'success' })
    } catch (error) {
      console.error("Failed to update user data:", error)
      setToast({ show: true, message: 'Failed to update user data', type: 'error' })
    }
  }

  const handleCancel = () => {
    setEditedData({ ...userData })
    setIsEditing(false)
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)
      try {
        const response = await authAxios.post("/members/profile-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        setUserData({ ...userData, profileInfo: { ...userData.profileInfo, profileImage: response.data.imageUrl } })
      } catch (error) {
        console.error("Failed to upload image:", error)
      }
    }
  }

  // Calculate win rate
  const totalGames = userData?.battleStats?.totalGames || 0;
  const winRate = userData?.battleStats?.winRate || 0;

  // Toast 컴포넌트 정의
  const Toast = () => {
    if (!toast.show) return null;

    return (
      <div 
        className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
        style={{ zIndex: 1000 }}
      >
        {toast.message}
      </div>
    );
  };

  // 모달 열기
  const handleOpenModal = async (type) => {
    try {
      const response = await authAxios.get(`/member/${type}`);
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
    setModalType(null);
    setModalUsers([]);
  };

  // 모달 내에서 팔로우/언팔로우
  const handleModalFollowToggle = async (targetId) => {
    try {
      if (currentUserFollowing.includes(targetId)) {
        // 언팔로우
        const response = await authAxios.delete(`/member/follow/${targetId}`);
        if (response.success) {
          setCurrentUserFollowing(prev => prev.filter(id => id !== targetId));
        }
      } else {
        // 팔로우
        const response = await authAxios.post(`/member/follow/${targetId}`);
        if (response.success) {
          setCurrentUserFollowing(prev => [...prev, targetId]);
        }
      }
      // 데이터 새로고침
      await fetchUserData();
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <NavBar /> */}

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-pink-200 to-blue-200 py-8">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-md">My page</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start clay bg-white p-6">
            {/* Profile Image Section */}
            <div className="w-full md:w-auto flex flex-col items-center gap-4">
              <div className="w-48 h-48 relative rounded-lg overflow-hidden bg-white shadow-md">
                <img 
                  src={userData.profileInfo?.profileImage || "/default-profile.png"}
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-48 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
              >
                이미지 수정
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* User Info & Stats */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-lg p-6 clay">
                <h2 className="text-xl font-bold mb-4">{userData.nickname}</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <p className="text-sm text-gray-600">응원 점수</p>
                    <p className="text-2xl font-bold">{userData.stats.cheerPoints}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <p className="text-sm text-gray-600">포인트</p>
                    <p className="text-2xl font-bold">{userData.stats.points}</p>
                  </div>
                  <div 
                    className="bg-blue-50 p-4 rounded-lg clay cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleOpenModal('follower')}
                  >
                    <p className="text-sm text-gray-600">팔로워</p>
                    <p className="text-2xl font-bold">{userData.stats.followers}</p>
                  </div>
                  <div 
                    className="bg-blue-50 p-4 rounded-lg clay cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleOpenModal('following')}
                  >
                    <p className="text-sm text-gray-600">팔로잉</p>
                    <p className="text-2xl font-bold">{userData.stats.following}</p>
                  </div>
                </div>

                {/* Battle Record */}
                <div className="bg-gray-50 p-4 rounded-lg clay">
                  <h3 className="text-lg font-semibold mb-4">내 전적 보기</h3>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 clay">
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
        </div>

        <div className="bg-white rounded-lg shadow-sm clay">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'report' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('report')}
            >
              발화 리포트
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'battle' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('battle')}
            >
              배틀 관리
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'vote' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('vote')}
            >
              투표 관리
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              내 정보 수정
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="bg-[#EEF6FF] rounded-lg p-8 clay">
                <h2 className="text-2xl font-bold mb-8 text-center">내 정보 수정</h2>
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">아이디</label>
                    <input
                      type="text"
                      name="id"
                      value={editedData.id}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">비밀번호</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        name="password"
                        value={editedData.password}
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-md"
                        readOnly
                      />
                      <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                        비밀번호 변경
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">이름</label>
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md"
                      readOnly={!isEditing}
                      placeholder="정해기"
                    />
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">닉네임</label>
                    <input
                      type="text"
                      name="nickname"
                      value={editedData.nickname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md"
                      readOnly={!isEditing}
                      placeholder="우끼끼정해기"
                    />
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">성별</label>
                    <div className="flex gap-8">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={editedData.gender === "male"}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span>남성</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={editedData.gender === "female"}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span>여성</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">생년월일</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        name="birthYear"
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md"
                        disabled={!isEditing}
                        value={editedData.birthYear || "1999"}
                        onChange={handleChange}
                      >
                        {Array.from({ length: 100 }, (_, i) => (
                          <option key={i} value={2024 - i}>
                            {2024 - i}
                          </option>
                        ))}
                      </select>
                      <select
                        name="birthMonth"
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md"
                        disabled={!isEditing}
                        value={editedData.birthMonth || "10"}
                        onChange={handleChange}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <select
                        name="birthDay"
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md"
                        disabled={!isEditing}
                        value={editedData.birthDay || "12"}
                        onChange={handleChange}
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">이메일</label>
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md"
                      readOnly={!isEditing}
                      placeholder="haegively@naver.com"
                    />
                  </div>

                  <div className="flex justify-center gap-4 pt-8">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-12 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          취소
                        </button>
                        <button type="submit" className="px-12 py-2.5 bg-[#A5C5F4] text-white rounded-md hover:bg-blue-400">
                          수정
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-12 py-2.5 bg-[#A5C5F4] text-white rounded-md hover:bg-blue-400"
                      >
                        수정하기
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
            {activeTab === 'report' && <MyPageReport />}
            {activeTab === 'battle' && <MyPageBattle />}
            {activeTab === 'vote' && <MyPageVote />}
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

      {/* Toast 컴포넌트 렌더링 */}
      <Toast />
    </div>
  )
}

export default MyPage

