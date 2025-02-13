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

  const [userData, setUserData] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [recentBattles, setRecentBattles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const fileInputRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAxios.get(`member/other-follower/${id}`)
        console.log("응답 데이터:", response.data[0])  // 데이터 구조 확인
        if (response.success) {
          setUserData(response.data[0])
          setIsFollowing(response.data[0].follow)
        }
      } catch (error) {
        console.error("유저 데이터 조회 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  // 팔로우/언팔로우 처리
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        const response = await authAxios.delete(`/member/follow/${userData.userId}`)
        if (response.success) {
          setIsFollowing(false)
        }
      } else {
        const response = await authAxios.post(`/member/follow/${userData.userId}`)
        if (response.success) {
          setIsFollowing(true)
        }
      }
      // 데이터 다시 불러오기
      const response = await authAxios.get(`member/other-follower/${id}`)
      if (response.success) {
        setUserData(response.data[0])
      }
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error)
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

  if (isLoading) return <div>로딩중...</div>
  if (!userData) return <div>사용자를 찾을 수 없습니다.</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* 프로필 이미지 */}
            <div className="relative w-32 h-32">
              <img
                src={profileImage || ""}
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
                  승률 {calculateWinRate()}%
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
    </div>
  )
}

export default UserProfile

