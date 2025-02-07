import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const VoteCreatingForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');  // content 상태 변수 사용
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [battleId, setBattleId] = useState(3);  // battleId 예시로 추가

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드가 채워졌는지 확인
    if (!title || !content || !option1 || !option2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login'); // 토큰이 없으면 로그인 페이지로 리디렉션
      return;
    }

    // 투표 데이터 구조
    const voteData = {
      title,
      content,  // content 필드 사용
      battleId, // battleId 추가
      options: [option1.trim(), option2.trim()] // 입력값 공백 제거 후 배열에 추가
    };

    // 데이터 로깅 (서버로 보내는 데이터 확인)
    console.log('✅ Vote data:', voteData);

    // 입력값 검증 (필요에 따라 추가적인 유효성 검사 가능)
    if (voteData.options.some(option => option === '')) {
      alert('선택지 1과 2를 모두 입력해주세요.');
      return;
    }

    try {
      console.log("🟢 Sending vote data:", voteData);
      console.log("🔵 Authorization Header:", `Bearer ${token}`);

      const response = await publicAxios.post('/vote/create', voteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("✅ Vote created successfully:", response.data);
      navigate(`/vote-detail/${response.data.voteId}`);
    } catch (error) {
      console.error("❌ Failed to create vote:", error.response?.data || error);
      if (error.response?.data?.message) {
        alert(`투표 생성에 실패했습니다: ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        console.error('Invalid input data:', error.response.data);
        alert('잘못된 입력값입니다.');
      } else if (error.response?.status === 404) {
        console.error('Resource not found:', error.response.data);
        alert('투표를 찾을 수 없습니다.');
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('투표 생성에 실패했습니다.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>투표 제목</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>설명</label>
        <input 
          type="text" 
          value={content}  // content 상태 변수 사용
          onChange={(e) => setContent(e.target.value)}  // setContent 사용
          required 
        />
      </div>
      <div>
        <label>선택지 1</label>
        <input 
          type="text" 
          value={option1} 
          onChange={(e) => setOption1(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>선택지 2</label>
        <input 
          type="text" 
          value={option2} 
          onChange={(e) => setOption2(e.target.value)} 
          required 
        />
      </div>
      <button type="submit">Create!</button>
    </form>
  );
};

export default VoteCreatingForm;
