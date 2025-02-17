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
    <dialog ref={ref} className="modal rounded-[30px] overflow-hidden">
      <div className="modal-box flex flex-col items-center p-8 bg-white rounded-[30px] w-[800px] clay" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-8 mt-2">
          <h3 className="text-2xl font-bold">오늘의 추천 주제는...</h3>
        </div>
        
        <div className="w-full flex items-center gap-4 mb-6">
          <div className="flex-1 clay bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="slot-machine bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg overflow-hidden min-h-[120px] h-auto">
              <div className={`slot-wrapper flex items-center justify-center ${isSpinning ? 'spinning' : ''}`}>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="slot-content py-4 px-6 w-full">
                    <p className="text-xl font-bold text-center whitespace-pre-line">
                      {topic ? (
                        <>
                          <span className="block text-black mb-2">
                            {topic.split('\n')[0]}
                          </span>
                          {topic.split('\n').slice(1).map((line, index) => (
                            <span 
                              key={index} 
                              className={`block ${index === 0 ? 'text-cusRed' : 'text-cusBlue'}`}
                            >
                              {line}
                            </span>
                          ))}
                        </>
                      ) : (
                        '주제를 생성해보세요!'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            className="w-16 h-16 bg-cusYellowLight hover:bg-cusYellow rounded-[20px] flex items-center justify-center transition-all hover:scale-105 flex-shrink-0 clay"
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
        
        <p className="text-lg font-bold mb-6">즐거운 배틀 되세요 :)</p>

        <form method="dialog" className="modal-backdrop">
          <button className="btn px-4 py-1.5 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center">
            닫기
          </button>
        </form>

        <style jsx>{`
          .modal {
            border: none;
            background: rgba(0, 0, 0, 0.5);
          }
          
          .clay {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 
              8px 8px 16px rgba(0, 0, 0, 0.1),
              -8px -8px 16px rgba(255, 255, 255, 0.8),
              inset 2px 2px 4px rgba(255, 255, 255, 0.8),
              inset -2px -2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .slot-machine {
            position: relative;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
          }
          
          .slot-wrapper {
            position: relative;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .slot-wrapper.spinning {
            animation: spin 2.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          }
          
          .slot-content {
            position: relative;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            border-radius: 8px;
          }
          
          @keyframes spin {
            0% { 
              transform: translateY(0);
              opacity: 1;
            }
            15% {
              transform: translateY(-80%);
              opacity: 0.2;
            }
            30% {
              transform: translateY(-160%);
              opacity: 0;
            }
            45% {
              transform: translateY(-240%);
              opacity: 0;
            }
            60% {
              transform: translateY(40%);
              opacity: 0.2;
            }
            75% {
              transform: translateY(20%);
              opacity: 0.6;
            }
            100% { 
              transform: translateY(0);
              opacity: 1;
            }
          }

          .btn {
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </dialog>
  );
});

BattleRandomTopic.displayName = 'BattleRandomTopic';

export default BattleRandomTopic;
