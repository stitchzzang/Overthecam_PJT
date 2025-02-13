const FollowList = ({ users, title, onToggleFollow }) => {
    if (users.length === 0) {
      return <p className="text-center text-gray-500">{title}하는 사용자가 없습니다.</p>
    }
  
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">{title} 목록</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.userId} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={user.profileImage}
                  alt={`${user.nickname}의 프로필`}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <span className="font-medium">{user.nickname}</span>
              </div>
              <button
                onClick={() => onToggleFollow(user.userId)}
                className={`px-4 py-2 rounded ${
                  user.follow ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {user.follow ? "언팔로우" : "팔로우"}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default FollowList
  
  