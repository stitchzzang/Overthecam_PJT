import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../../common/axiosinstance';  // publicAxios -> authAxios

const VoteCreatingForm = ({ onCreateVote }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [battleId, setBattleId] = useState(3);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !option1 || !option2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const voteData = {
      title: title.trim(),
      content: content.trim(),
      battleId: Number(battleId),
      options: [option1.trim(), option2.trim()]
    };

    if (voteData.options.some(option => option === '')) {
      alert('선택지 1과 2를 모두 입력해주세요.');
      return;
    }

    // 부모 컴포넌트의 핸들러에게 데이터 전달
    onCreateVote(voteData);
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
