"use client"

import { useState, useRef, useEffect } from "react"
import NavBar from "../../components/Layout/NavBar"
import { authAxios } from "../../common/axiosinstance"
import MyPageReport from './MyPageReport'
import MyPageBattle from './MyPageBattle'
import MyPageVote from './MyPageVote'
import { useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../../store/User/UserStore';
import AiReport from './AiReport';  // 새로운 AiReport import

// 팔로워/팔로잉 모달 컴포넌트
const FollowModal = ({ isOpen, onClose, title, users, onFollowToggle, currentUserFollowing }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/main/profile/${userId}`);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold text-center">{title}</h3>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {users.length > 0 ? (
            users.map((user) => (
              <div 
                key={user.userId} 
                className="p-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleUserClick(user.userId)}
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.nickname} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg text-gray-500">
                        {user.nickname.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-gray-800">{user.nickname}</span>
                </div>
                {user.userId !== Number(localStorage.getItem('userId')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowToggle(user.userId);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors clay flex items-center justify-center gap-2 ${
                      currentUserFollowing.includes(user.userId)
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {currentUserFollowing.includes(user.userId) ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-5 h-5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-5 h-5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" 
                        />
                      </svg>
                    )}
                    {currentUserFollowing.includes(user.userId) ? '언팔로우' : '팔로우'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              목록이 비어있습니다
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// 이미지 리사이징 함수 추가
const resizeImage = (file, maxWidth) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 이미지가 maxWidth보다 큰 경우에만 리사이징
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 캔버스를 Blob으로 변환
        canvas.toBlob((blob) => {
          // Blob을 File 객체로 변환
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, 'image/jpeg', 0.7); // 품질 70%로 설정
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// 전화번호 포맷팅 함수
const formatPhoneNumber = (value) => {
  if (!value) return "";
  const numbers = value.replace(/[^\d]/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 닉네임 중복 체크 함수 수정
const checkNicknameDuplicate = async (nickname) => {
  try {
    const response = await authAxios.get(`/member/check-nickname/${nickname}`);
    console.log("닉네임 중복 체크 응답:", response);
    return !response.data; // true면 중복, false면 사용 가능
  } catch (error) {
    console.error("닉네임 중복 체크 실패:", error);
    return false;
  }
};

// 전화번호 중복 체크 함수 수정
const checkPhoneNumberDuplicate = async (phoneNumber) => {
  try {
    const response = await authAxios.get(`/member/check-phone/${phoneNumber}`);
    console.log("전화번호 중복 체크 응답:", response);
    return !response.data; // true면 중복, false면 사용 가능
  } catch (error) {
    console.error("전화번호 중복 체크 실패:", error);
    return false;
  }
};

function MyPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'vote');

  const [userData, setUserData] = useState({
    id: "",
    password: "",
    name: "",
    nickname: "",
    birthDate: "",
    email: "",
    gender: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
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
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState({ show: false, message: '', type: null })
  const [modalType, setModalType] = useState(null);
  const [modalUsers, setModalUsers] = useState([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState({
    first: "",
    middle: "",
    last: ""
  });

  // Zustand store에서 setUserNickname 가져오기
  const setUserNickname = useUserStore((state) => state.setUserNickname);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 프로필 정보 가져오기
        const profileResponse = await authAxios.post("/mypage/profile");
        const profileData = profileResponse.data;

        // 통계 정보 가져오기
        const statsResponse = await authAxios.get("/mypage/stats");
        const statsData = statsResponse.data;
        
        setUserData({
          email: profileData.email,
          username: profileData.username,  // 여기서 username 설정
          nickname: profileData.nickname,
          phoneNumber: profileData.phoneNumber,
          gender: profileData.gender,
          birth: profileData.birth,
          profileInfo: {
            profileImage: statsData.profileInfo?.profileImage
          },
          stats: {
            cheerPoints: statsData.scoreInfo?.supportScore || 0,
            points: statsData.scoreInfo?.point || 0,
            followers: statsData.followStats?.followerCount || 0,
            following: statsData.followStats?.followingCount || 0,
          },
          battleStats: {
            totalGames: statsData.battleStats?.totalGames || 0,
            win: statsData.battleStats?.win || 0,
            draw: statsData.battleStats?.draw || 0,
            loss: statsData.battleStats?.loss || 0,
            winRate: statsData.battleStats?.winRate || 0
          }
        });

        setEditedData({
          password: "",
          nickname: profileData.nickname,
          phoneNumber: profileData.phoneNumber
        });

        if (editedData.phoneNumber) {
          const [first, middle, last] = editedData.phoneNumber.split('-');
          setPhoneNumbers({
            first: first || "",
            middle: middle || "",
            last: last || ""
          });
        }

      } catch (error) {
        console.error("Failed to load user data:", error);
        setToast({ show: true, message: '사용자 정보를 불러오는데 실패했습니다', type: 'error' });
      }
    };

    fetchUserData();
  }, []);

  // 입력 핸들러 수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setEditedData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 제출 핸들러 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 닉네임 길이 체크
    if (editedData.nickname.length < 2 || editedData.nickname.length > 8) {
      setToast({ 
        show: true, 
        message: '닉네임은 2~8자 사이로 입력해주세요.', 
        type: 'error' 
      });
      return;
    }

    // 비밀번호 유효성 검사 추가
    if (isChangingPassword) {
      if (!editedData.password) {
        setToast({ 
          show: true, 
          message: '비밀번호가 빈칸입니다.', 
          type: 'error' 
        });
        return;
      }

      // 비밀번호 형식 검증
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
      if (!passwordRegex.test(editedData.password)) {
        setToast({ 
          show: true, 
          message: '비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다.', 
          type: 'error' 
        });
        return;
      }

      // 비밀번호 확인 검사
      if (editedData.password !== passwordConfirm) {
        setToast({ 
          show: true, 
          message: '비밀번호가 일치하지 않습니다.', 
          type: 'error' 
        });
        return;
      }
    }

    if (!editedData.nickname.trim()) {
      setToast({ 
        show: true, 
        message: '닉네임이 빈칸입니다.', 
        type: 'error' 
      });
      return;
    }

    if (!editedData.phoneNumber) {
      setToast({ 
        show: true, 
        message: '전화번호가 빈칸입니다.', 
        type: 'error' 
      });
      return;
    }

    try {
      const updateData = {
        password: isChangingPassword ? editedData.password : "",
        nickname: editedData.nickname,
        phoneNumber: editedData.phoneNumber
      };

      const response = await authAxios.post("/mypage/profile", updateData);
      
      setUserData(prev => ({
        ...prev,
        ...response.data
      }));

      // Zustand store 닉네임 업데이트
      setUserNickname(editedData.nickname);
      
      // localStorage 업데이트
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        nickname: editedData.nickname
      }));
      
      setIsEditing(false);
      setToast({ 
        show: true, 
        message: '프로필이 성공적으로 수정되었습니다.', 
        type: 'success' 
      });
      setTimeout(() => setToast({ show: false, message: '', type: null }), 1000);

    } catch (error) {
      console.error('프로필 수정 에러:', error);
      
      // 서버에서 전달된 에러 메시지 사용
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          '프로필 수정에 실패했습니다.';
      
      setToast({ 
        show: true, 
        message: errorMessage,
        type: 'error' 
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
          showToast('파일 크기는 1MB 이하여야 합니다.', 'error');
          return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          showToast('JPG, PNG 형식의 이미지만 업로드 가능합니다.', 'error');
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await authAxios.post("/mypage/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        console.log("업로드 응답:", response);

        if (response.success) {
          // 파일을 Base64로 변환
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;
            
            // Base64 문자열을 localStorage에 저장
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            localStorage.setItem('userInfo', JSON.stringify({
              ...userInfo,
              profileImage: base64String
            }));

            // 이벤트 발생
            const event = new CustomEvent('profileImageUpdated', {
              detail: { profileImage: base64String }
            });
            window.dispatchEvent(event);

            // UI 업데이트
            setUserData(prev => ({
              ...prev,
              profileInfo: {
                ...prev.profileInfo,
                profileImage: base64String
              }
            }));

            showToast('프로필 이미지가 업데이트되었습니다.', 'success');
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        showToast(error.response?.data?.message || '이미지 업로드에 실패했습니다.', 'error');
      }
    }
  };

  // Calculate win rate
  const totalGames = userData?.battleStats?.totalGames || 0;
  const winRate = userData?.battleStats?.winRate || 0;

  // 토스트 메시지 자동 제거 함수
  const showToast = (message, type) => {
    setToast({ 
      show: true, 
      message, 
      type 
    });
    
    // 2초 후 토스트 메시지 제거
    setTimeout(() => {
      setToast({ show: false, message: '', type: null });
    }, 2000);
  };

  // 모달 열기
  const handleOpenModal = async (type) => {
    try {
      const response = await authAxios.get(`/member/${type}`);
      if (response.success) {
        setModalUsers(response.data || []);
        setModalType(type);
        
        // 현재 사용자의 팔로잉 목록도 함께 가져오기
        const followingResponse = await authAxios.get('/member/following');
        if (followingResponse.success) {
          setCurrentUserFollowing(followingResponse.data?.map(user => user.userId) || []);
        }
      }
    } catch (error) {
      console.error(`${type} 목록 조회 실패:`, error);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalType(null);
    setModalUsers([]);
  };

  // 모달 내에서 팔로우/언팔로우
  const handleModalFollowToggle = async (targetId) => {
    try {
      if (currentUserFollowing.includes(targetId)) {
        // 언팔로우
        const response = await authAxios.delete(`/member/follow/${targetId}`);
        if (response.success) {
          // 즉시 UI 업데이트
          setCurrentUserFollowing(prev => prev.filter(id => id !== targetId));
          setModalUsers(prev => prev.map(user => 
            user.userId === targetId 
              ? { ...user, isFollowing: false }
              : user
          ));
          // 팔로워/팔로잉 수 업데이트
          if (modalType === 'following') {
            setCounts(prev => ({
              ...prev,
              following: prev.following - 1
            }));
          }
        }
      } else {
        // 팔로우
        const response = await authAxios.post(`/member/follow/${targetId}`);
        if (response.success) {
          // 즉시 UI 업데이트
          setCurrentUserFollowing(prev => [...prev, targetId]);
          setModalUsers(prev => prev.map(user => 
            user.userId === targetId 
              ? { ...user, isFollowing: true }
              : user
          ));
        }

      }
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneChange = (part, value) => {
    // 숫자만 입력 가능
    const numbers = value.replace(/[^\d]/g, "");
    
    setPhoneNumbers(prev => ({
      ...prev,
      [part]: numbers
    }));

    // 전체 전화번호 업데이트
    const updatedPhoneNumbers = {
      ...phoneNumbers,
      [part]: numbers
    };

    setEditedData(prev => ({
      ...prev,
      phoneNumber: `${updatedPhoneNumbers.first}-${updatedPhoneNumbers.middle}-${updatedPhoneNumbers.last}`
    }));

    // 자동 포커스 이동
    if (part === 'first' && numbers.length === 3) {
      document.getElementById('phone-middle').focus();
    } else if (part === 'middle' && numbers.length === 4) {
      document.getElementById('phone-last').focus();
    }
  };

  // 전화번호 입력 필드 UI
  const renderPhoneFields = () => (
    <div className="grid grid-cols-[120px,1fr] items-center gap-4">
      <label className="text-sm font-medium">전화번호</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={phoneNumbers.first}
          onChange={(e) => handlePhoneChange('first', e.target.value)}
          className="w-20 px-4 py-2 bg-white border border-gray-200 rounded-md text-center"
          placeholder="010"
          maxLength="3"
        />
        <span className="text-gray-500">-</span>
        <input
          id="phone-middle"
          type="text"
          value={phoneNumbers.middle}
          onChange={(e) => handlePhoneChange('middle', e.target.value)}
          className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-md text-center"
          placeholder="0000"
          maxLength="4"
        />
        <span className="text-gray-500">-</span>
        <input
          id="phone-last"
          type="text"
          value={phoneNumbers.last}
          onChange={(e) => handlePhoneChange('last', e.target.value)}
          className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-md text-center"
          placeholder="0000"
          maxLength="4"
        />
      </div>
    </div>
  );

  // 비밀번호 필드 렌더링 함수
  const renderPasswordFields = () => {
    return (
      <div className="grid grid-cols-[120px,1fr] items-center gap-4">
        <label className="text-sm font-medium">비밀번호</label>
        <div className="flex gap-2 items-center">
          <input
            type="password"
            value="********"
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md"
            readOnly
          />
          {/* 수정 모드일 때만 비밀번호 변경 버튼 표시 */}
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-cusBlue text-white rounded-lg hover:bg-cusBlue-dark transition-colors text-sm whitespace-nowrap"
            >
              비밀번호 변경
            </button>
          )}
        </div>

        {/* 비밀번호 변경 모드일 때 추가 입력 필드들 */}
        {isChangingPassword && (
          <>
            <div className="col-span-2 mt-4">
              <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                <label className="text-sm font-medium">새 비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={editedData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                <label className="text-sm font-medium">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <NavBar /> */}
      <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue p-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
          프로필 페이지
        </h1>
      </div>
      {/* Header with gradient background */}
      {/* <div className="bg-gradient-to-r from-pink-200 to-blue-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-left drop-shadow-md">프로필 페이지</h1>
        </div>
      </div> */}

      <div className="max-w-6.5xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start clay bg-cusGray-light p-6">
            {/* Profile Image Section */}
            <div className="w-full md:w-auto flex flex-col items-center gap-4">
              <div className="w-48 h-48 relative rounded-lg overflow-hidden bg-white shadow-md">
                <img 
                  src={userData.profileInfo?.profileImage || "/assets/default-profile.png"}
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-48 py-2 bg-cusPink-light text-cusRed rounded-full hover:bg-cusPink transition-colors text-sm font-medium clay"
              >
                이미지 수정
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* User Info & Stats */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-lg p-6 clay">
                <h2 className="text-xl font-bold mb-4">{userData.nickname}</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <div className="flex items-center justify-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-6 h-6 text-gray-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" 
                        />
                      </svg>
                      <p className="text-sm text-gray-600">응원 점수</p>
                    </div>
                    <p className="text-2xl font-bold text-center">{userData.stats.cheerPoints}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg clay">
                    <div className="flex items-center justify-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-6 h-6 text-gray-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" 
                        />
                      </svg>
                      <p className="text-sm text-gray-600">포인트</p>
                    </div>
                    <p className="text-2xl font-bold text-center">{userData.stats.points}</p>
                  </div>
                  <div 
                    className="bg-blue-50 p-4 rounded-lg clay cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleOpenModal('follower')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-6 h-6 text-gray-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
                        />
                      </svg>
                      <p className="text-sm text-gray-600">팔로워</p>
                    </div>
                    <p className="text-2xl font-bold text-center">{userData.stats.followers}</p>
                  </div>
                  <div 
                    className="bg-blue-50 p-4 rounded-lg clay cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleOpenModal('following')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-6 h-6 text-gray-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
                        />
                      </svg>
                      <p className="text-sm text-gray-600">팔로잉</p>
                    </div>
                    <p className="text-2xl font-bold text-center">{userData.stats.following}</p>
                  </div>
                </div>

                {/* Battle Record */}
                <div className="bg-gray-50 p-4 rounded-lg clay">
                  <h3 className="text-lg font-semibold mb-4">배틀 전적 보기</h3>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 clay">
                        <span className="text-blue-600 text-xl font-bold">{userData.battleStats?.win || 0}</span>
                      </div>
                      <p className="text-sm text-gray-600">승</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 clay">
                        <span className="text-gray-600 text-xl font-bold">{userData.battleStats?.draw || 0}</span>
                      </div>
                      <p className="text-sm text-gray-600">무</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2 clay">
                        <span className="text-red-500 text-xl font-bold">{userData.battleStats?.loss || 0}</span>
                      </div>
                      <p className="text-sm text-gray-600">패</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    <span className="font-bold">{userData.nickname}</span> 님의 승률은 <span className="font-bold">{userData.battleStats?.winRate || 0}%</span> 입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cusGray-light rounded-lg shadow-sm clay">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'report' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('report')}
            >
              발화 리포트
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'battle' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('battle')}
            >
              배틀 관리
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'vote' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('vote')}
            >
              투표 관리
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              내 정보 수정
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="bg-[#EEF6FF] rounded-lg p-8 clay">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-center">내 정보 수정</h2>
                  {!isEditing && (
                    
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-cusBlue text-white rounded-lg hover:bg-cusBlue-dark transition-colors"
                    >
                      수정하기
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">이메일</label>
                    <input
                      type="text"
                      value={userData.email}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md"
                      readOnly
                    />
                  </div>

                  {/* 비밀번호 필드 */}
                  {renderPasswordFields()}

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">이름</label>
                    <input
                      type="text"
                      value={userData.username}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">닉네임</label>
                    <input
                      type="text"
                      name="nickname"
                      value={isEditing ? editedData.nickname : userData.nickname}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-100'
                      }`}
                      readOnly={!isEditing}
                      placeholder="새 닉네임을 입력하세요"
                      maxLength={8}
                    />
                  </div>

                  {/* 전화번호 필드 */}
                  <div className="grid grid-cols-[120px,1fr] items-center gap-4">
                    <label className="text-sm font-medium">전화번호</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="phoneNumber"
                        value={isEditing ? editedData.phoneNumber : userData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border border-gray-200 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100'
                        }`}
                        readOnly={!isEditing}
                        placeholder="전화번호를 입력하세요"
                      />
                    </div>
                  </div>

                  {/* 저장/취소 버튼은 isEditing이 true일 때만 표시 */}
                  {isEditing && (
                    <div className="flex justify-center gap-4 mt-8">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-cusBlue text-white rounded-lg hover:bg-cusBlue-dark transition-colors"
                      >
                        저장하기
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setIsChangingPassword(false);
                          setPasswordConfirm("");
                          setEditedData({...userData});
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
            {activeTab === 'report' && <AiReport />}
            {activeTab === 'battle' && <MyPageBattle />}
            {activeTab === 'vote' && <MyPageVote />}
          </div>
        </div>
      </div>

      {/* 팔로워/팔로잉 모달 */}
      <FollowModal
        isOpen={modalType !== null}
        onClose={handleCloseModal}
        title={modalType === 'follower' ? '팔로워' : '팔로잉'}
        users={modalUsers}
        onFollowToggle={handleModalFollowToggle}
        currentUserFollowing={currentUserFollowing}
      />

      {/* Toast 컴포넌트 렌더링 */}
      {toast.show && (
        <div 
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          style={{ zIndex: 1000 }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default MyPage

