// src/Login/FindAccount.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

const FindAccount = () => {
  const [findIdForm, setFindIdForm] = useState({
    username: '',
    phoneNumber: '',
    birth: ''
  });

  const [findPwForm, setFindPwForm] = useState({
    email: '',
    username: '',
    phoneNumber1: '',  // 010
    phoneNumber2: '',  // 1234
    phoneNumber3: ''   // 5678
  });

  const [message, setMessage] = useState({ text: '', isError: false });
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const formattedPhoneNumber = findIdForm.phoneNumber.includes('-') 
        ? findIdForm.phoneNumber 
        : findIdForm.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      
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
      
      const response = await publicAxios.post('/auth/find-email', requestData);
      console.log('서버 응답:', response); // 응답 확인용 로그

      if (response.data && response.data.email) {
        setMessage({
          text: `회원님의 이메일은 ${response.data.email} 입니다.`,
          isError: false
        });
      } else {
        throw new Error('이메일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('에러 상세:', error); // 에러 확인용 로그
      setMessage({
        text: error.response?.data?.message || '아이디 찾기에 실패했습니다.',
        isError: true
      });
    }
  };

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    try {
      const formattedPhoneNumber = `${findPwForm.phoneNumber1}-${findPwForm.phoneNumber2}-${findPwForm.phoneNumber3}`;

      const requestData = {
        email: findPwForm.email.trim(),
        username: findPwForm.username.trim(),
        phoneNumber: formattedPhoneNumber
      };

      const response = await publicAxios.post('/auth/verify-password-reset', requestData);

      if (response.success) {
        setIsUserVerified(true);
        setMessage({
          text: '사용자 확인이 완료되었습니다. 새 비밀번호를 설정해주세요.',
          isError: false
        });
      }
    } catch (error) {
      setMessage({
        text: error.error?.message || '사용자 확인에 실패했습니다.',
        isError: true
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const requestData = {
        email: findPwForm.email.trim(),
        newPassword: newPassword
      };
      
      const response = await publicAxios.post('/auth/reset-password', requestData);

      if (response.success) {
        setMessage({
          text: '비밀번호가 변경되었습니다!',
          isError: false
        });
        
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          window.location.replace('/main/login');
        }, 2000);
      }
    } catch (error) {
      setMessage({
        text: error.error?.message || '비밀번호 재설정에 실패했습니다.',
        isError: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Motion Design */}
      <div className="hidden lg:block lg:w-[55%] p-12">
        <div className="h-full w-full rounded-3xl overflow-hidden">
          <CursorMotionEffect />
        </div>
      </div>

      {/* Right Side - Find Account Forms */}
      <div className="w-full lg:w-[45%] p-12">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">계정 찾기</h1>

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
                아이디 찾기
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
                    value={findPwForm.email}
                    onChange={(e) => setFindPwForm({...findPwForm, email: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">이름</label>
                  <input
                    type="text"
                    value={findPwForm.username}
                    onChange={(e) => setFindPwForm({...findPwForm, username: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">전화번호</label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      maxLength="3"
                      value={findPwForm.phoneNumber1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 3) {
                          setFindPwForm({...findPwForm, phoneNumber1: value});
                          if (value.length === 3) {
                            document.querySelector('input[name="phoneNumber2"]').focus();
                          }
                        }
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 text-center"
                      placeholder="010"
                      required
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      name="phoneNumber2"
                      maxLength="4"
                      value={findPwForm.phoneNumber2}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 4) {
                          setFindPwForm({...findPwForm, phoneNumber2: value});
                          if (value.length === 4) {
                            document.querySelector('input[name="phoneNumber3"]').focus();
                          }
                        }
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 text-center"
                      placeholder="1234"
                      required
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      name="phoneNumber3"
                      maxLength="4"
                      value={findPwForm.phoneNumber3}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 4) {
                          setFindPwForm({...findPwForm, phoneNumber3: value});
                        }
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 text-center"
                      placeholder="5678"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors text-base"
                >
                  비밀번호 찾기
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">새 비밀번호</label>
                  <div className="flex-1 relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-base font-bold text-gray-900 w-24 text-right">비밀번호 확인</label>
                  <div className="flex-1 relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <div className="text-red-500 text-sm text-center">
                    {passwordError}
                  </div>
                )}
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
              to="/main/login"
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-center text-base"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      {/* 중앙 모달 메시지 */}
      {message.text && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className={`text-center mb-4 ${message.isError ? 'text-red-600' : 'text-blue-600'}`}>
              {message.text}
            </div>
            <button
              onClick={() => setMessage({ text: '', isError: false })}
              className="w-full px-4 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindAccount;