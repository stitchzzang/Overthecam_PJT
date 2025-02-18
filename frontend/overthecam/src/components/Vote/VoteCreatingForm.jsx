import React, { useState } from 'react';

const VoteCreatingForm = ({ onCreateVote, disabled }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedOption1 = option1.trim();
    const trimmedOption2 = option2.trim();

    if (!trimmedTitle || !trimmedContent || !trimmedOption1 || !trimmedOption2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
      alert('제목은 2~100자 사이로 입력해주세요.');
      return;
    }

    const voteData = {
      title: trimmedTitle,
      content: trimmedContent,
      options: [
        trimmedOption1,
        trimmedOption2
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
        <div className="flex items-center">
          <label className="text-xl font-bold min-w-[100px] w-28">투표 제목</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="2글자 이상 입력"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
        
        <div className="flex items-center">
          <label className="text-xl font-bold min-w-[100px] w-28">설명</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="설명"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent resize-none h-24"
            disabled={disabled}
            required 
          />
        </div>
        
        <div className="flex items-center">
          <label className="text-xl font-bold min-w-[100px] w-28">선택지 1</label>
          <input 
            type="text" 
            value={option1} 
            onChange={(e) => setOption1(e.target.value)} 
            placeholder="선택지 1"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
        
        <div className="flex items-center">
          <label className="text-xl font-bold min-w-[100px] w-28">선택지 2</label>
          <input 
            type="text" 
            value={option2} 
            onChange={(e) => setOption2(e.target.value)} 
            placeholder="선택지 2"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cusBlue focus:border-transparent"
            disabled={disabled}
            required 
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={disabled}
        className="btn min-w-[120px] w-1/3 self-center bg-cusBlue text-cusLightBlue-lighter hover:bg-cusLightBlue hover:text-cusBlue px-4 py-3 mt-6 whitespace-nowrap"
      >
        생성 
      </button>
    </form>
  );
};

export default VoteCreatingForm;