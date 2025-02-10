import { useState, useRef } from "react";
import NavBar from "../../components/Layout/NavBar";
import useAuthStore from "../../store/User/UserStore";

function MyPageVote() {
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
  });

  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const fileInputRef = useRef(null);
  const [showMyVotesOnly, setShowMyVotesOnly] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 샘플 투표 데이터
  const votes = [
    {
      id: 1,
      title: "갯벌 논쟁: 된다 vs 안 된다",
      status: "삭제",
      options: [
        { name: "안 된다", percentage: 30, color: "bg-gray-300" },
        { name: "된다", percentage: 70, color: "bg-pink-300" }
      ]
    },
    {
      id: 2,
      title: "짬뽕 vs 짜장",
      status: "진행중",
      options: [
        { name: "짬뽕", percentage: 60, color: "bg-blue-300" },
        { name: "짜장", percentage: 40, color: "bg-gray-300" }
      ]
    },
    {
      id: 3,
      title: "김치찜 vs 제육",
      status: "삭제",
      options: [
        { name: "김치찜", percentage: 55, color: "bg-blue-300" },
        { name: "제육", percentage: 45, color: "bg-gray-300" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-200 to-blue-200 py-8">
        <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg" style={{ fontFamily: 'GmarketSansBold' }}>
          My page
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                이미지 수정
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* User Stats Section */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">@{userData.nickname || "HaeGively"}</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-gray-600 mb-1">응원점수</p>
                  <p className="text-xl font-bold">{userData.stats.cheerPoints || 100}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-gray-600 mb-1">포인트</p>
                  <p className="text-xl font-bold">{userData.stats.points || 3000}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-gray-600 mb-1">팔로워</p>
                  <p className="text-xl font-bold">{userData.stats.followers || 100}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-gray-600 mb-1">팔로잉</p>
                  <p className="text-xl font-bold">{userData.stats.following || 50}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">내 전적</h3>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <span className="text-blue-600 text-xl font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-600">승</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <span className="text-gray-600 text-xl font-bold">0</span>
                    </div>
                    <p className="text-sm text-gray-600">무</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
                      <span className="text-red-500 text-xl font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-600">패</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vote Management Section */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">투표 관리</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">내 투표만 보기</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showMyVotesOnly}
                  onChange={(e) => setShowMyVotesOnly(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            {votes.map((vote) => (
              <div key={vote.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{vote.title}</h3>
                  <div className="flex gap-2">
                    {vote.status === "삭제" && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm">
                        삭제
                      </span>
                    )}
                    <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md text-sm hover:bg-gray-300 transition-colors">
                      정해지 님
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {vote.options.map((option, index) => (
                    <div key={index} className="relative h-8">
                      <div className={`absolute inset-0 ${option.color} rounded-md`} style={{ width: `${option.percentage}%` }}></div>
                      <div className="absolute inset-0 flex items-center px-4">
                        <span className="text-sm font-medium">{option.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPageVote;
