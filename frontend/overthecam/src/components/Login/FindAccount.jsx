// src/Login/FindAccount.jsx
import React, { useState } from 'react';

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
    <div className="auth-container">
      <h1>Find Account</h1>
      
      <section className="find-section">
        <h2>아이디 찾기</h2>
        <form onSubmit={handleFindId}>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={findIdForm.name}
              onChange={handleIdFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              placeholder="example@site.com"
              value={findIdForm.email}
              onChange={handleIdFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>생년월일</label>
            <div className="birth-date">
              <select name="birthYear" value={findIdForm.birthYear} onChange={handleIdFormChange}>
                <option value="">년도</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select name="birthMonth" value={findIdForm.birthMonth} onChange={handleIdFormChange}>
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select name="birthDay" value={findIdForm.birthDay} onChange={handleIdFormChange}>
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button type="submit">Find</button>
        </form>
      </section>

      <hr />
      
      <section className="find-section">
        <h2>비밀번호 찾기</h2>
        <form onSubmit={handleFindPw}>
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              name="userId"
              value={findPwForm.userId}
              onChange={handlePwFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              placeholder="example@site.com"
              value={findPwForm.email}
              onChange={handlePwFormChange}
              required
            />
          </div>
          
          <button type="submit">Find</button>
        </form>
      </section>
    </div>
  );
};

export default FindAccount;