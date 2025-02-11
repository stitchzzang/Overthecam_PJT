import React, { useState } from 'react';

const VoteCreatingForm = ({ onCreateVote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  // battleId state 제거 (API 명세에 없음)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !option1 || !option2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // API 명세와 정확히 일치하는 데이터 구조
    const voteData = {
      title: title.trim(),
      content: content.trim(),
      options: [
        option1.trim(),
        option2.trim()
      ]
    };

    if (voteData.options.some(option => option === '')) {
      alert('선택지 1과 2를 모두 입력해주세요.');
      return;
    }

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
