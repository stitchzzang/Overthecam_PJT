// src/Login/FindAccount.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const FindAccount = () => {
  const [findIdForm, setFindIdForm] = useState({
    username: '',
    phoneNumber: '',
    birth: ''
  });

  const [findPwForm, setFindPwForm] = useState({
    email: '',
    username: '',
    phoneNumber: ''
  });

  const [message, setMessage] = useState({ text: '', isError: false });
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleIdFormChange = (e) => {
    setFindIdForm({
      ...findIdForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePwFormChange = (e) => {
    setFindPwForm({
      ...findPwForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      // 전화번호에 하이픈이 없는 경우에만 추가
      const formattedPhoneNumber = findIdForm.phoneNumber.includes('-') 
        ? findIdForm.phoneNumber 
        : findIdForm.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      
      // 생년월일 형식 확인
      if (!findIdForm.birth) {
        setMessage({
          text: '생년월일을 입력해주세요.',
          isError: true
        });
        return;
      }

      const requestData = {
        username: findIdForm.username.trim(),
        phoneNumber: formattedPhoneNumber,
        birth: findIdForm.birth
      };
      
      console.log("아이디 찾기 요청 데이터:", requestData);
      
      const response = await publicAxios.post('/auth/find-email', requestData);
      console.log("아이디 찾기 응답:", response);

      if (response && response.data && response.data.code === 200) {
        setMessage({
          text: `찾은 이메일: ${response.data.data.email}`,
          isError: false
        });
      }
    } catch (error) {
      setMessage({
        text: error.message || '아이디 찾기에 실패했습니다.',
        isError: true
      });
    }
  };

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    try {
      // 전화번호에 하이픈이 없는 경우에만 추가
      const formattedPhoneNumber = findPwForm.phoneNumber.includes('-') 
        ? findPwForm.phoneNumber 
        : findPwForm.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

      const requestData = {
        email: findPwForm.email.trim(),
        username: findPwForm.username.trim(),
        phoneNumber: formattedPhoneNumber
      };

      console.log("비밀번호 찾기 사용자 확인 요청 데이터:", requestData);
      
      const response = await publicAxios.post('/auth/verify-password-reset', requestData);
      console.log("비밀번호 찾기 사용자 확인 응답:", response);

      if (response && response.data && response.data.code === 200) {
        setIsUserVerified(true);
        setMessage({
          text: '사용자 확인이 완료되었습니다. 새 비밀번호를 설정해주세요.',
          isError: false
        });
      }
    } catch (error) {
      setMessage({
        text: error.message || '사용자 확인에 실패했습니다.',
        isError: true
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        email: findPwForm.email.trim(),
        newPassword: newPassword
      };

      console.log("비밀번호 재설정 요청 데이터:", requestData);
      
      const response = await publicAxios.post('/auth/reset-password', requestData);
      console.log("비밀번호 재설정 응답:", response);

      if (response && response.data && response.data.code === 200) {
        setMessage({
          text: '비밀번호가 성공적으로 재설정되었습니다.',
          isError: false
        });
        // 로그인 페이지로 리다이렉트
        window.location.replace('/login');
      }
    } catch (error) {
      setMessage({
        text: error.message || '비밀번호 재설정에 실패했습니다.',
        isError: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-[55%] p-12">
        <div className="h-full w-full rounded-3xl overflow-hidden">
          <img 
            src="/images/loginPageImage.png" 
            alt="Find Account decoration" 
            className="w-full h-full object-cover translate-x-8"
          />
        </div>
      </div>

      {/* Right Side - Find Account Forms */}
      <div className="w-full lg:w-[45%] p-12">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">계정 찾기</h1>

          {message.text && (
            <div className={`p-4 rounded-xl ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          {/* ID 찾기 폼 */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">아이디 찾기</h2>
            <form onSubmit={handleFindId} className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">이름</label>
                <input
                  type="text"
                  name="username"
                  value={findIdForm.username}
                  onChange={(e) => setFindIdForm({...findIdForm, username: e.target.value})}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">전화번호</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={findIdForm.phoneNumber}
                  onChange={(e) => setFindIdForm({...findIdForm, phoneNumber: e.target.value})}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">생년월일</label>
                <div className="flex-1 flex gap-2">
                  <select
                    name="year"
                    value={findIdForm.birth.split('-')[0] || ''}
                    onChange={(e) => {
                      const [_, month, day] = findIdForm.birth.split('-');
                      setFindIdForm({
                        ...findIdForm,
                        birth: `${e.target.value}-${month || '01'}-${day || '01'}`
                      });
                    }}
                    className="w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  >
                    <option value="">년도</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    name="month"
                    value={findIdForm.birth.split('-')[1] || ''}
                    onChange={(e) => {
                      const [year, _, day] = findIdForm.birth.split('-');
                      setFindIdForm({
                        ...findIdForm,
                        birth: `${year || new Date().getFullYear()}-${e.target.value.padStart(2, '0')}-${day || '01'}`
                      });
                    }}
                    className="w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>{month}월</option>
                    ))}
                  </select>

                  <select
                    name="day"
                    value={findIdForm.birth.split('-')[2] || ''}
                    onChange={(e) => {
                      const [year, month] = findIdForm.birth.split('-');
                      setFindIdForm({
                        ...findIdForm,
                        birth: `${year || new Date().getFullYear()}-${month || '01'}-${e.target.value.padStart(2, '0')}`
                      });
                    }}
                    className="w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day.toString().padStart(2, '0')}>{day}일</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors text-base"
              >
                Find
              </button>
            </form>
          </div>

          <hr className="my-6" />

          {/* 비밀번호 찾기 폼 */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">비밀번호 찾기</h2>
            {!isUserVerified ? (
              <form onSubmit={handleVerifyUser} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">이메일</label>
                  <input
                    type="email"
                    name="email"
                    value={findPwForm.email}
                    onChange={(e) => setFindPwForm({...findPwForm, email: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">아이디</label>
                  <input
                    type="text"
                    name="username"
                    value={findPwForm.username}
                    onChange={(e) => setFindPwForm({...findPwForm, username: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">전화번호</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={findPwForm.phoneNumber}
                    onChange={(e) => setFindPwForm({...findPwForm, phoneNumber: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors text-base"
                >
                  Verify
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors text-base"
                >
                  비밀번호 재설정
                </button>
              </form>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/login"
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-center text-base"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindAccount;