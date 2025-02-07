import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import NavBar from "../../components/Layout/NavBar"
import { authAxios } from "../../common/axiosinstance"

function UserProfile() {
  const { userId } = useParams()
  const [userData, setUserData] = useState(null)
  const [followingList, setFollowingList] = useState([])
  const [error, setError] = useState(null)

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authAxios.get(`/member/${userId}`)
      setUserData(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("사용자 정보를 불러오는 데 실패했습니다.")
    }
  }, [userId])

  const fetchFollowingList = useCallback(async () => {
    try {
      const response = await authAxios.get("/member/my-following")
      if (response.data.code === 200) {
        setFollowingList(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      console.error("Error fetching following list:", error)
      setError("팔로잉 목록을 불러오는 데 실패했습니다.")
    }
  }, [])

  useEffect(() => {
    fetchUserData()
    fetchFollowingList()
  }, [fetchUserData, fetchFollowingList])

  const handleFollowToggle = async (targetUserId) => {
    try {
      if (followingList.some((user) => user.userId === targetUserId)) {
        await authAxios.delete(`/member/follow/${targetUserId}`)
        setFollowingList((prev) => prev.filter((user) => user.userId !== targetUserId))
      } else {
        await authAxios.post(`/member/follow/${targetUserId}`)
        const response = await authAxios.get(`/member/${targetUserId}`)
        setFollowingList((prev) => [...prev, response.data])
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      setError("팔로우 상태를 변경하는 데 문제가 발생했습니다. 다시 시도해주세요.")
    }
  }

  if (error) return <div className="text-red-500">{error}</div>
  if (!userData) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">사용자 프로필</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{userData.nickname}의 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">이름</p>
              <p className="font-semibold">{userData.name}</p>
            </div>
            <div>
              <p className="text-gray-600">이메일</p>
              <p className="font-semibold">{userData.email}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">팔로잉 목록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followingList.map((user) => (
              <div key={user.userId} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <span>{user.nickname}</span>
                </div>
                <button
                  onClick={() => handleFollowToggle(user.userId)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  {user.follow ? "언팔로우" : "팔로우"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

