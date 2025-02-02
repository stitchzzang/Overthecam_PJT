import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const initialDummyUsers = [
  {
    userId: "testuser1",
    password: "password123",
    name: "김철수",
    gender: "male",
    nickname: "철수123",
    birthDate: "1995-05-15",
    email: "test1@test.com"
  },
  {
    userId: "testuser2",
    password: "password456",
    name: "이영희",
    gender: "female",
    nickname: "영희456",
    birthDate: "1998-08-22",
    email: "test2@test.com"
  },
  {
    userId: "testuser3",
    password: "password789",
    name: "박민수",
    gender: "male",
    nickname: "민수789",
    birthDate: "2000-12-30",
    email: "test3@test.com"
  }
];

const Signup = () => {
  const [dummyUsers, setDummyUsers] = useState(initialDummyUsers);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    gender: '',
    nickname: '',
    birthDate: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const isUserExist = dummyUsers.some(user => user.userId === formData.userId || user.email === formData.email);
    if (isUserExist) {
      setMessage('이미 존재하는 아이디 또는 이메일입니다.');
      return;
    }

    // 새 회원 정보 추가
    const newUser = { ...formData };
    delete newUser.passwordConfirm;
    setDummyUsers([...dummyUsers, newUser]);

    // 성공 메시지 설정 및 콘솔 로그
    setMessage('회원가입이 성공적으로 완료되었습니다!');
    console.log('회원가입 성공:', newUser);
    
    // 3초 후 로그인 페이지로 이동
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="userId"
          placeholder="아이디"
          value={formData.userId}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          id="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          id="passwordConfirm"
          placeholder="비밀번호 확인"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          id="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <select
          id="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">성별 선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
        <input
          type="text"
          id="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          id="birthDate"
          placeholder="생년월일"
          value={formData.birthDate}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          id="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">가입하기</button>
      </form>
      <p>이미 계정이 있으신가요? <Link to="/">로그인</Link></p>
    </div>
  );
};

export default Signup;