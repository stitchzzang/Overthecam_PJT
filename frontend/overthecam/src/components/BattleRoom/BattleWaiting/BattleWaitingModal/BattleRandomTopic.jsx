import React, { forwardRef, useState } from 'react';
import axios from 'axios';

const BattleRandomTopic = forwardRef((props, ref) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const fetchRandomTopic = async () => {
    setIsLoading(true);
    setIsSpinning(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTopic('로그인이 필요한 서비스입니다.');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/battle/random`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setTopic(response.data.data.title);
      } else {
        setTopic(response.data.error?.message || '주제 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('랜덤 주제 가져오기 실패:', error);
      
      // 에러 상태 코드에 따른 구체적인 메시지
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setTopic('인증이 만료되었습니다. 다시 로그인해주세요.');
            break;
          case 500:
            setTopic('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            break;
          default:
            setTopic(error.response.data?.error?.message || 
                    '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else if (error.request) {
        setTopic('서버와 통신할 수 없습니다. 인터넷 연결을 확인해주세요.');
      } else {
        setTopic('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
      // 애니메이션이 끝나고 나서 spinning 상태를 false로 변경
      setTimeout(() => setIsSpinning(false), 2000);
    }
  };

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex flex-col items-center p-6 bg-white rounded-lg max-w-3xl w-full clay">
        <div className="flex items-center gap-2 mb-8">
          <h3 className="text-2xl font-bold">오늘의 추천 주제는...</h3>
        </div>
        
        <div className="w-full flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center text-lg w-full">
              <div className="slot-machine flex-1 px-8 min-h-[100px] bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg mx-2 clay">
                <div className={`slot-wrapper h-full flex items-center justify-center ${isSpinning ? 'spinning' : ''}`}>
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
            className="h-16 aspect-square bg-cusYellow hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all clay"
            onClick={fetchRandomTopic}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-8 h-8"
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
        .clay {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        
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
          0% { 
            transform: translateY(0);
            opacity: 1;
          }
          20% { 
            transform: translateY(-500%);
            opacity: 0;
          }
          40% { 
            transform: translateY(-1000%);
            opacity: 0;
          }
          60% { 
            transform: translateY(-1500%);
            opacity: 0;
          }
          80% { 
            transform: translateY(-2000%);
            opacity: 0;
          }
          90% {
            transform: translateY(50%);
            opacity: 0;
          }
          100% { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </dialog>
  );
});

BattleRandomTopic.displayName = 'BattleRandomTopic';

export default BattleRandomTopic;
