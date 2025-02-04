import { useState, useRef } from "react"
import NavBar from "../../components/Layout/NavBar"

function MyPage() {
  const [userData, setUserData] = useState({
    id: "",
    password: "",
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

  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({ ...userData })
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUserData({ ...userData, ...editedData })
    setIsEditing(false)
    console.log("Updated user data:", editedData)
  }

  const handleCancel = () => {
    setEditedData({ ...userData })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">My Page</h1>

        {/* 프로필 및 통계 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 프로필 이미지 섹션 */}
            <div className="flex-shrink-0 w-full md:w-40">
              <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setProfileImage(e.target.result)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <button
                className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => fileInputRef.current.click()}
              >
                이미지 변경
              </button>
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
                <h3 className="text-lg font-semibold mb-2">내 전적</h3>
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

        {/* 내 정보 수정 섹션 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">내 정보 수정</h2>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
                아이디
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                id="id"
                type="text"
                name="id"
                value={editedData.id}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                비밀번호
              </label>
              <div className="flex items-center">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  id="password"
                  type="password"
                  name="password"
                  value={editedData.password}
                  readOnly
                />
                <button
                  type="button"
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => alert("비밀번호 변경 로직을 구현해주세요.")}
                >
                  변경
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                이름
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing && "bg-gray-100"}`}
                id="name"
                type="text"
                name="name"
                value={editedData.name}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nickname">
                닉네임
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing && "bg-gray-100"}`}
                id="nickname"
                type="text"
                name="nickname"
                value={editedData.nickname}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthDate">
                생년월일
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing && "bg-gray-100"}`}
                id="birthDate"
                type="date"
                name="birthDate"
                value={editedData.birthDate}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                이메일
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing && "bg-gray-100"}`}
                id="email"
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="flex items-center justify-center">
              {isEditing ? (
                <>
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    type="button"
                    onClick={handleCancel}
                  >
                    취소
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    저장
                  </button>
                </>
              ) : (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  수정하기
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MyPage

