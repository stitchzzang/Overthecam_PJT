import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from "../../components/Layout/NavBar";
import { authAxios } from '../../common/axiosinstance';

function OtherUserPage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authAxios.get(`/member/${userId}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('사용자 정보를 불러오는 데 실패했습니다.');
    }
  }, [userId]);

  const checkFollowStatus = useCallback(async () => {
    try {
      const response = await authAxios.get('/member/my-following');
      setIsFollowing(response.data.some(following => following.id === userId));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [userId]);

  const fetchFollowCounts = useCallback(async () => {
    try {
      const followersResponse = await authAxios.get(`/member/other-follower/${userId}`);
      const followingResponse = await authAxios.get(`/member/other-following/${userId}`);
      setFollowersCount(followersResponse.data.length);
      setFollowingCount(followingResponse.data.length);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
    checkFollowStatus();
    fetchFollowCounts();
  }, [userId, fetchUserData, checkFollowStatus, fetchFollowCounts]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await authAxios.delete(`/member/follow/${userId}`);
        setFollowersCount(prev => prev - 1);
      } else {
        await authAxios.post(`/member/follow/${userId}`);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('팔로우 상태를 변경하는 데 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="w-24"></div>
          <h1 className="text-3xl font-bold text-center flex-grow">User Profile</h1>
          <button
            className={`${
              isFollowing ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'
            } text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline w-24`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
        
        {/* Profile and Stats Section */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex-shrink-0 w-full md:w-40">
              <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                <img
                  src={userData.profileImageUrl || "/placeholder.svg"}
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
                  <p className="text-2xl font-bold">{userData.cheerPoints}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-2xl font-bold">{userData.points}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="text-2xl font-bold">{followersCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Following</p>
                  <p className="text-2xl font-bold">{followingCount}</p>
                </div>
              </div>

              {/* Record Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Battle Record</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-blue-500 text-2xl font-bold">{userData.wins}</p>
                    <p className="text-sm text-gray-600">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-2xl font-bold">{userData.draws}</p>
                    <p className="text-sm text-gray-600">Draws</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-500 text-2xl font-bold">{userData.losses}</p>
                    <p className="text-sm text-gray-600">Losses</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {userData.nickname}'s win rate is {((userData.wins / (userData.wins + userData.draws + userData.losses)) * 100).toFixed(1)}%
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