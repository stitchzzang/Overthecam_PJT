// src/Login/FindAccount.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FindAccount = () => {
  const [findIdForm, setFindIdForm] = useState({
    name: '',
    email: '',
    birthYear: '',
    birthMonth: '',
    birthDay: ''
  });

  const [findPwForm, setFindPwForm] = useState({
    userId: '',
    email: ''
  });

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

  const handleFindId = (e) => {
    e.preventDefault();
    console.log('아이디 찾기:', findIdForm);
  };

  const handleFindPw = (e) => {
    e.preventDefault();
    console.log('비밀번호 찾기:', findPwForm);
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
          <h1 className="text-2xl font-bold text-gray-900">Find Account</h1>

          {/* ID 찾기 폼 */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">아이디 찾기</h2>
            <form className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">이름</label>
                <input
                  type="text"
                  name="name"
                  value={findIdForm.name}
                  onChange={(e) => setFindIdForm({...findIdForm, name: e.target.value})}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={findIdForm.email}
                  onChange={(e) => setFindIdForm({...findIdForm, email: e.target.value})}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">생년월일</label>
                <div className="flex-1 flex gap-2">
                  <select
                    name="birthYear"
                    value={findIdForm.birthYear}
                    onChange={(e) => setFindIdForm({...findIdForm, birthYear: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  >
                    <option value="">년도</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    name="birthMonth"
                    value={findIdForm.birthMonth}
                    onChange={(e) => setFindIdForm({...findIdForm, birthMonth: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    name="birthDay"
                    value={findIdForm.birthDay}
                    onChange={(e) => setFindIdForm({...findIdForm, birthDay: e.target.value})}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
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
            <form className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-base font-bold text-gray-900 w-24 text-right">아이디</label>
                <input
                  type="text"
                  name="userId"
                  value={findPwForm.userId}
                  onChange={(e) => setFindPwForm({...findPwForm, userId: e.target.value})}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                />
              </div>

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

              <button
                type="submit"
                className="w-full px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors text-base"
              >
                Find
              </button>
            </form>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/login"
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-center text-base"
            >
              BACK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindAccount;