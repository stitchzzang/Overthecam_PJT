import React, { forwardRef, useState } from 'react';
import axios from 'axios';

const BattleRandomTopic = forwardRef((props, ref) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomTopic = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/battle/random`);
      console.log('Random topic response:', response.data);
      if (response.data.success) {
        setTopic(response.data.data.title);
      }
    } catch (error) {
      console.error('랜덤 주제 가져오기 실패:', error.response || error);
      setTopic('주제를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex flex-col items-center p-6 bg-white rounded-lg max-w-3xl w-full">
        <div className="flex items-center gap-2 mb-8">
          <h3 className="text-2xl font-bold">오늘의 추천 주제는...</h3>
        </div>
        
        <div className="w-full flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center text-lg w-full">
              <div className="slot-machine flex-1 px-8 min-h-[100px] bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg mx-2">
                <div className="slot-wrapper h-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-pulse">...</div>
                  ) : (
                    <p className="text-lg font-bold whitespace-pre-line text-center py-4">
                      {topic || '주제를 생성해보세요!'}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-bold whitespace-pre ml-2">입니다!</span>
            </div>
          </div>
          <button 
            className="h-16 aspect-square bg-cusYellow hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all"
            onClick={fetchRandomTopic}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className={`w-8 h-8 ${isLoading ? 'animate-spin' : ''}`}
            >
              <path d="M16 16V12L21 17L16 22V18H4V16H16ZM8 2V5.999L20 6V8H8V12L3 7L8 2Z" />
            </svg>
          </button>
        </div>
        
        <p className="text-lg">즐거운 배틀 되세요 :)</p>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>

      <style jsx>{`
        .slot-machine {
          overflow: hidden;
          position: relative;
        }
        
        .slot-wrapper {
          position: relative;
          transition: all 0.5s ease-out;
        }
        
        .slot-wrapper.spinning {
          animation: spin 2s ease-out;
        }
        
        @keyframes spin {
          0% { transform: translateY(0); }
          20% { transform: translateY(-100%); }
          40% { transform: translateY(-200%); }
          60% { transform: translateY(-300%); }
          80% { transform: translateY(-400%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </dialog>
  );
});

BattleRandomTopic.displayName = 'BattleRandomTopic';

export default BattleRandomTopic;
