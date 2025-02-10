import { useState, useRef } from "react";
import NavBar from "../../components/Layout/NavBar";
import useAuthStore from "../../store/User/UserStore";

function MyPageBattle() {
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

        {/* Battle History Table */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">배틀 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">날짜</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">방송 제목</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">선택지</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-600">승패여부</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">2025-01-12 17:39</td>
                  <td className="py-4 px-4 text-gray-800">갯벌 논쟁: 맨다 vs 안맨다</td>
                  <td className="py-4 px-4 text-gray-800">맨다</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-green-600">승 (+100)</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">2025-01-12 21:40</td>
                  <td className="py-4 px-4 text-gray-800">김치찜 vs 제육: 뭐가 더...</td>
                  <td className="py-4 px-4 text-gray-800">얼큰한 김치찜</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-red-600">패 (-300)</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">2025-01-13 20:13</td>
                  <td className="py-4 px-4 text-gray-800">물복 vs 딱복</td>
                  <td className="py-4 px-4 text-gray-800">딱복은 살인무기</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-red-600">패 (-1000)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPageBattle;