"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import NavBar from "../../components/Layout/NavBar"
import { authAxios } from "../../common/axiosinstance"

function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  console.log("UserProfile rendered. Current URL:", window.location.href)
  console.log("userId from useParams:", userId)

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || userId === ":userId") {
        console.error("Invalid userId:", userId)
        setError("유효하지 않은 사용자 ID입니다. URL을 확인해 주세요.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log("Fetching data for userId:", userId)
        const response = await authAxios.get(`/member/${userId}`)
        console.log("API Response:", response.data)
        setUserData(response.data)
        setIsFollowing(response.data.isFollowing)
        setProfileImage(response.data.profileImage || "/placeholder.svg")
        setRecentBattles(response.data.recentBattles || [])
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(`사용자 데이터를 불러오는 데 실패했습니다: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleFollowToggle = async () => {
    if (!userId || userId === ":userId") {
      console.error("Cannot toggle follow: Invalid userId")
      return
    }

    try {
      if (isFollowing) {
        await authAxios.post(`/member/unfollow/${userId}`)
      } else {
        await authAxios.post(`/member/follow/${userId}`)
      }
      setIsFollowing(!isFollowing)
      setUserData((prevData) => ({
        ...prevData,
        stats: {
          ...prevData.stats,
          followers: isFollowing ? prevData.stats.followers - 1 : prevData.stats.followers + 1,
        },
      }))
    } catch (err) {
      console.error("Error toggling follow status:", err)
      alert("팔로우 상태를 업데이트하는 데 실패했습니다. 다시 시도해 주세요.")
    }
  }

  if (isLoading) return <div className="text-center mt-8">로딩 중...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">{userData.nickname}의 프로필</h1>
        <div className="flex justify-end mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs w-16"
            onClick={handleFollowToggle}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </button>
        </div>

        {/* 프로필 및 통계 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 프로필 이미지 섹션 */}
            <div className="flex-shrink-0 w-full md:w-40">
              <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt={`${userData.nickname}의 프로필`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 통계 정보 섹션 */}
            <div className="flex-grow">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">응원점수</p>
                  <p className="text-2xl font-bold">{userData.stats.cheerPoints}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">포인트</p>
                  <p className="text-2xl font-bold">{userData.stats.points}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">팔로워</p>
                  <p className="text-2xl font-bold">{userData.stats.followers}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">팔로잉</p>
                  <p className="text-2xl font-bold">{userData.stats.following}</p>
                </div>
              </div>

              {/* 전적 섹션 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">전적</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-blue-500 text-2xl font-bold">{userData.stats.record.wins}</p>
                    <p className="text-sm text-gray-600">승</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-2xl font-bold">{userData.stats.record.draws}</p>
                    <p className="text-sm text-gray-600">무</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-500 text-2xl font-bold">{userData.stats.record.losses}</p>
                    <p className="text-sm text-gray-600">패</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {userData.nickname} 님의 승률은{" "}
                  {(
                    (userData.stats.record.wins /
                      (userData.stats.record.wins + userData.stats.record.draws + userData.stats.record.losses)) *
                    100
                  ).toFixed(1)}
                  % 입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 배틀 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">최근 배틀</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBattles.map((battle, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{battle.title}</h3>
                <p className="text-sm text-gray-600">{battle.date}</p>
                <p className="text-sm mt-2">{battle.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

