"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import NavBar from "../../components/Layout/NavBar"
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
      if (!isLoggedIn) {
        navigate("/login")
        return
      }
      try {
        setIsLoading(true)
        setError(null)

        // TODO: Replace with actual API call
        const response = await authAxios.get(`/member/${id}`)
        const fetchedData = response.data

        setUserData(fetchedData)
        setIsFollowing(fetchedData.isFollowing)
        setProfileImage(fetchedData.profileImage || "/placeholder.svg")
        setRecentBattles(fetchedData.recentBattles || [])
        setIsCurrentUser(currentUserId === id)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [id, currentUserId, isLoggedIn, navigate])

  const handleFollowToggle = async () => {
    if (!id) {
      console.error("Cannot toggle follow: Invalid id")
      return
    }

    try {
      const userIdNum = Number.parseInt(id)
      if (isNaN(userIdNum)) {
        throw new Error("잘못된 사용자 ID입니다.")
      }

      let response
      if (isFollowing) {
        response = await authAxios.delete(`/member/follow/${userIdNum}`)
      } else {
        response = await authAxios.post(`/member/follow/${userIdNum}`)
      }

      if (response.data.code === 200) {
        setIsFollowing(!isFollowing)
        setUserData((prevData) => ({
          ...prevData,
          stats: {
            ...prevData.stats,
            followers: isFollowing ? prevData.stats.followers - 1 : prevData.stats.followers + 1,
          },
        }))
      }
    } catch (err) {
      console.error("Error toggling follow status:", err)
      let errorMessage = "팔로우 상태를 업데이트하는 데 실패했습니다."

      if (err.response) {
        switch (err.response.data.code) {
          case 400:
            errorMessage = "자기 자신을 팔로우할 수 없습니다."
            break
          case 404:
            errorMessage = "사용자를 찾을 수 없습니다."
            break
          case 409:
            errorMessage = "이미 팔로우한 사용자입니다."
            break
          default:
            errorMessage = err.response.data.message || errorMessage
        }
      }

      alert(errorMessage)
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

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    // 이미지 파일 타입 체크
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

  if (isLoading) return <div className="text-center mt-8">로딩 중...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            {/* 프로필 이미지 섹션 */}
            <div
              className="relative w-32"
              onMouseEnter={() => isCurrentUser && setIsHovered(true)}
              onMouseLeave={() => isCurrentUser && setIsHovered(false)}
            >
              <img
                src={profileImage || "/placeholder.svg"}
                alt="프로필"
                className={`w-32 h-32 rounded-lg object-cover cursor-${isCurrentUser ? "pointer" : "default"}`}
                onClick={handleImageClick}
              />
              {isCurrentUser && isHovered && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={handleImageClick}
                >
                  <span className="text-white text-sm">프로필 사진 변경</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* 프로필 정보 */}
            <div className="flex-grow">
              {/* 닉네임과 팔로우 버튼 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{userData.nickname}</h2>
                  <p className="text-gray-600">@{userData.id}</p>
                </div>
                {!isCurrentUser && (
                  <button
                    onClick={handleFollowToggle}
                    className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full"
                  >
                    {isFollowing ? "언팔로우" : "팔로우"}
                  </button>
                )}
              </div>

              {/* 통계 정보 */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{userData.stats.cheerPoints}</div>
                  <div className="text-sm text-gray-600">응원점수</div>
                </div>
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
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
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
    </div>
  )
}

export default UserProfile

