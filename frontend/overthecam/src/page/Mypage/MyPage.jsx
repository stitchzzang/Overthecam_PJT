"use client"

import { useState, useRef, useEffect } from "react"
import NavBar from "../../components/Layout/NavBar"
import { authAxios } from "../../common/axiosinstance"
import MyPageReport from './MyPageReport'
import MyPageBattle from './MyPageBattle'
import MyPageVote from './MyPageVote'

function MyPage() {
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
  const [profileImage, setProfileImage] = useState("")
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState({ show: false, message: '', type: null })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 로그인한 사용자의 정보를 가져오는 API 호출
        const response = await authAxios.get("/members/me")  // 인증된 요청
        const apiData = response.data
        
        // 회원가입 때 입력했던 모든 정보를 가져옴
        setUserData({
          id: apiData.id,
          email: apiData.email,
          username: apiData.username,
          nickname: apiData.nickname,
          gender: apiData.gender,  // 0 또는 1
          birth: apiData.birth,    // "YYYY-MM-DD" 형식
          phoneNumber: apiData.phoneNumber,
          stats: {
            cheerPoints: apiData.stats?.cheerPoints || 0,
            points: apiData.stats?.points || 0,
            followers: apiData.stats?.followers || 0,
            following: apiData.stats?.following || 0,
            record: {
              wins: apiData.stats?.record?.wins || 0,
              draws: apiData.stats?.record?.draws || 0,
              losses: apiData.stats?.record?.losses || 0,
            },
          },
        })

        // 수정 가능한 필드들만 editedData에 설정
        setEditedData({
          password: "",  // 비밀번호는 빈 값으로 초기화
          username: apiData.username,
          nickname: apiData.nickname,
          phoneNumber: apiData.phoneNumber
        })

      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [])

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
        setProfileImage(response.data.imageUrl)
      } catch (error) {
        console.error("Failed to upload image:", error)
      }
    }
  }

  // Calculate win rate
  const totalGames = userData.stats.record.wins + userData.stats.record.draws + userData.stats.record.losses
  const winRate = totalGames > 0 ? ((userData.stats.record.wins / totalGames) * 100).toFixed(1) : 0

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
                <img src={profileImage || ""} alt="Profile" className="w-full h-full object-cover" />
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
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <p className="text-sm text-gray-600">응원점수</p>
                    <p className="text-2xl font-bold">{userData.stats.cheerPoints}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <p className="text-sm text-gray-600">포인트</p>
                    <p className="text-2xl font-bold">{userData.stats.points}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <p className="text-sm text-gray-600">팔로워</p>
                    <p className="text-2xl font-bold">{userData.stats.followers}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg clay">
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
                        <span className="text-blue-600 text-xl font-bold">{userData.stats.record.wins}</span>
                      </div>
                      <p className="text-sm text-gray-600">승</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 clay">
                        <span className="text-gray-600 text-xl font-bold">{userData.stats.record.draws}</span>
                      </div>
                      <p className="text-sm text-gray-600">무</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2 clay">
                        <span className="text-red-500 text-xl font-bold">{userData.stats.record.losses}</span>
                      </div>
                      <p className="text-sm text-gray-600">패</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {userData.nickname} 님의 승률은 {winRate}% 입니다.
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

      {/* Toast 컴포넌트 렌더링 */}
      <Toast />
    </div>
  )
}

export default MyPage

