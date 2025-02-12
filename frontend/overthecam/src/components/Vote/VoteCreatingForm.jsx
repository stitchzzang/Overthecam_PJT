import React, { useState } from 'react';

const VoteCreatingForm = ({ onCreateVote, disabled }) => {
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
    <form onSubmit={handleSubmit} className="w-full max-w-md px-8">
      <div className="space-y-4">
        <div>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="투표 제목"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
        
        <div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="설명"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent resize-none h-24"
            disabled={disabled}
            required 
          />
        </div>
        
        <div>
          <input 
            type="text" 
            value={option1} 
            onChange={(e) => setOption1(e.target.value)} 
            placeholder="선택지 1"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
        
        <div>
          <input 
            type="text" 
            value={option2} 
            onChange={(e) => setOption2(e.target.value)} 
            placeholder="선택지 2"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={disabled}
        className="w-full mt-6 py-2 bg-cusBlue hover:bg-cusBlue-light text-white font-semibold rounded-lg transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        투표 생성하기
      </button>
    </form>
  );
};

export default VoteCreatingForm;
