import React from 'react';
import NavBar from "../../components/Layout/NavBar";

function OtherUserPage() {
  // This would typically come from an API call or props
  const userData = {
    name: 'Jane Doe',
    nickname: 'JD',
    birthDate: '1992-05-15',
    email: 'jane.doe@example.com',
    stats: {
      cheerPoints: 150,
      points: 4500,
      followers: 250,
      following: 100,
      record: {
        wins: 3,
        draws: 1,
        losses: 1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="w-24"></div> {/* Spacer */}
          <h1 className="text-3xl font-bold text-center flex-grow">User Profile</h1>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline w-24"
            type="button"
          >
            Follow
          </button>
        </div>
        
        {/* Profile and Stats Section */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex-shrink-0 w-full md:w-40">
              <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                <img
                  src="/placeholder.svg"
                  alt="Profile Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold mb-4">{userData.nickname}'s Profile</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Cheer Points</p>
                  <p className="text-2xl font-bold">{userData.stats.cheerPoints}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-2xl font-bold">{userData.stats.points}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="text-2xl font-bold">{userData.stats.followers}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Following</p>
                  <p className="text-2xl font-bold">{userData.stats.following}</p>
                </div>
              </div>

              {/* Record Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Battle Record</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-blue-500 text-2xl font-bold">{userData.stats.record.wins}</p>
                    <p className="text-sm text-gray-600">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-2xl font-bold">{userData.stats.record.draws}</p>
                    <p className="text-sm text-gray-600">Draws</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-500 text-2xl font-bold">{userData.stats.record.losses}</p>
                    <p className="text-sm text-gray-600">Losses</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {userData.nickname}'s win rate is {((userData.stats.record.wins / (userData.stats.record.wins + userData.stats.record.draws + userData.stats.record.losses)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Section */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">User Information</h2>
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              {/* <label className="block text-gray-700 text-sm font-bold mb-2">
                User ID */}
              {/* </label> */}
              {/* <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                {userData.id} */}
              {/* </p> */}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                {userData.name}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nickname
              </label>
              <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                {userData.nickname}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Birth Date
              </label>
              <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                {userData.birthDate}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                {userData.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtherUserPage;