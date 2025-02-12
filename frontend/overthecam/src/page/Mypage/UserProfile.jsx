"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { authAxios } from "../../common/axiosinstance"
import useAuthStore from "../../store/User/UserStore.jsx"

function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { userId: currentUserId, isLoggedIn } = useAuthStore()

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    nickname: "",
    birthDate: "",
    email: "",
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
  const [isFollowing, setIsFollowing] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [recentBattles, setRecentBattles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const fileInputRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const userInfo = localStorage.getItem("userInfo")
        const currentUserInfo = userInfo ? JSON.parse(userInfo) : null

        const profileId = id
        console.log("Current user info:", currentUserInfo)
        console.log("Viewing profile ID:", profileId)

        if (currentUserInfo && currentUserInfo.userId.toString() === profileId) {
          navigate("/mypage")
          return
        }

        // 사용자 정보를 가져오는 API 호출
        const response = await authAxios.get(`member/other-follower/${profileId}`)
        console.log("Profile data response:", response)

        if (!response) {
          throw new Error("프로필 데이터를 불러올 수 없습니다.")
        }

        setUserData({
          id: response.id,
          name: response.name,
          nickname: response.nickname,
          email: response.email,
          stats: response.stats || {
            cheerPoints: 0,
            points: 0,
            followers: 0,
            following: 0,
            record: { wins: 0, draws: 0, losses: 0 },
          },
        })

        setIsFollowing(!!response.isFollowing)
        setProfileImage(response.profileImage || "/placeholder.svg")
        setRecentBattles(response.recentBattles || [])
        setIsCurrentUser(currentUserInfo?.userId.toString() === profileId)
      } catch (err) {
        console.error("Error fetching user data:", err)
        if (err.response?.status === 404) {
          setError("사용자를 찾을 수 없습니다.")
        } else {
          setError(err.message || "데이터를 불러오는데 실패했습니다.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (id && id !== ":userId") {
      fetchUserData()
    }
  }, [id, navigate])

  const handleFollowToggle = async () => {
    try {
      const targetUserId = id
      console.log("Attempting to", isFollowing ? "unfollow" : "follow", "user:", targetUserId)

      const url = `member/follow/${targetUserId}`
      const method = isFollowing ? "delete" : "post"

      const response = await authAxios[method](url)
      console.log("Follow toggle response:", response)

      if (response.success) {
        setIsFollowing(!isFollowing)
        await fetchUserData()
        alert(isFollowing ? "언팔로우 되었습니다." : "팔로우 되었습니다.")
      }
    } catch (error) {
      console.error("Follow toggle error details:", error)  // 전체 에러 객체 확인
      
      // 409 에러 체크 수정
      if (error.error?.status === 409 || error.status === 409) {
        alert(isFollowing ? "이미 언팔로우한 사용자입니다." : "이미 팔로우한 사용자입니다.")
        // 현재 상태 다시 확인
        await fetchUserData()
      } else {
        alert("팔로우 상태 업데이트에 실패했습니다.")
        // 현재 상태로 복원
        await fetchUserData()
      }
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await authAxios.get(`member/other-follower/${id}`)
      console.log("Fetched user data:", response)
      
      if (response && response.data) {
        // response.data가 배열인 경우와 객체인 경우 모두 처리
        const userData = Array.isArray(response.data) ? response.data[0] : response.data
        
        // userData가 존재하고 필요한 속성이 있는지 확인
        if (userData && userData.stats) {
          setUserData((prevData) => ({
            ...prevData,
            stats: {
              ...prevData.stats,
              ...userData.stats,
              followers: userData.stats.followers || prevData.stats.followers,
            },
          }))
          setIsFollowing(!!userData.isFollowing)
        }
      }
    } catch (error) {
      console.error("Error fetching updated user data:", error)
      // 에러 발생 시 이전 상태 유지
      setError("사용자 데이터를 불러오는데 실패했습니다.")
    }
  }

  const calculateWinRate = () => {
    const { wins, draws, losses } = userData.stats.record
    const total = wins + draws + losses
    return total === 0 ? 0 : ((wins / total) * 100).toFixed(1)
  }

  const handleImageClick = () => {
    if (isCurrentUser) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await authAxios.post("/member/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.code === 200) {
        setProfileImage(URL.createObjectURL(file))
      }
    } catch (err) {
      console.error("Error uploading profile image:", err)
      alert("프로필 이미지 업로드에 실패했습니다.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-lg">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* 프로필 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* 프로필 이미지 */}
              <div className="relative w-32 h-32">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-2xl font-bold">{userData.nickname}</h1>
                  {!isCurrentUser && (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {isFollowing ? "언팔로우" : "팔로우"}
                    </button>
                  )}
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{userData.stats.points}</div>
                    <div className="text-sm text-gray-600">포인트</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{userData.stats.followers}</div>
                    <div className="text-sm text-gray-600">팔로워</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{userData.stats.following}</div>
                    <div className="text-sm text-gray-600">팔로잉</div>
                  </div>
                </div>

                {/* 전적 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-around items-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{userData.stats.record.wins}</div>
                      <div className="text-sm text-gray-600">승</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-500">{userData.stats.record.draws}</div>
                      <div className="text-sm text-gray-600">무</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{userData.stats.record.losses}</div>
                      <div className="text-sm text-gray-600">패</div>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {userData.nickname}님의 승률은 {calculateWinRate()}% 입니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 배틀 기록 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">배틀</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">날짜</th>
                    <th className="pb-2">방송 제목</th>
                    <th className="pb-2">선택한 방송</th>
                    <th className="pb-2">승패여부</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBattles.map((battle, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{battle.date}</td>
                      <td className="py-2">{battle.title}</td>
                      <td className="py-2">{battle.selectedBroadcast}</td>
                      <td className={`py-2 ${battle.result > 0 ? "text-red-500" : "text-blue-500"}`}>
                        {battle.result > 0 ? `+${battle.result}` : battle.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile

