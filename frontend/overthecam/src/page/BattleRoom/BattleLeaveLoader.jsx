// BattleLeaveLoader 컴포넌트를 forwardRef로 수정
import React, { forwardRef, useImperativeHandle, useState } from 'react';

const BattleLeaveLoader = forwardRef(({title = "페이지 이동 중 입니다"}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useImperativeHandle(ref, () => ({
    setLoading: (loading) => setIsLoading(loading),
    getLoading: () => isLoading
  }));

  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4">
        <img
          src="/assets/loading2.gif"
          alt="Loading animation"
          className="h-24 w-40"
        />
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
});

export default BattleLeaveLoader;