import React, { forwardRef, useState } from "react";
import { authAxios } from "../../../../common/axiosinstance";

const BattleRandomTopic = forwardRef((props, ref) => {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const fetchRandomTopic = async () => {
    setIsLoading(true);
    setIsSpinning(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTopic("로그인이 필요한 서비스입니다.");
        return;
      }

      const response = await authAxios.get('/battle/random');
      console.log('서버 응답:', response.data.title);
      
      // 응답에서 바로 title을 가져옵니다
      if (response.data && response.data.title) {
        setTopic(response.data.title);
      } else {
        setTopic("주제 생성에 실패했습니다. 다시 시도해주세요.");
      }

    } catch (error) {
      console.error("상세 에러 정보:", error);
      setTopic("주제 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSpinning(false), 2000);
    }
  };

  return (
    <dialog
      ref={ref}
      className="random-topic-modal rounded-[30px] overflow-hidden"
    >
      <div
        className="random-topic-modal-box flex flex-col items-center p-8 bg-white rounded-[30px] w-[800px] random-topic-clay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-full gap-2 mb-6 mt-2">
          <h3 className="text-3xl font-bold text-center">
            오늘의 추천 주제는...
          </h3>
        </div>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="flex-1 random-topic-clay bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="slot-machine bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg overflow-hidden min-h-[120px] h-auto">
              <div
                className={`slot-wrapper flex items-center justify-center ${
                  isSpinning ? "spinning" : ""
                }`}
              >
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="slot-content py-4 px-6 w-full">
                    <p className="text-xl font-bold text-center whitespace-pre-line">
                      {topic ? (
                        <>
                          {/* 첫 번째 줄: 질문 (검정색) */}
                          <span className="block text-black mb-2">
                            {topic.split("\n")[0]}
                          </span>
                          {/* 두 번째 줄: 첫 번째 선택지 (빨간색) */}
                          <span className="block text-cusRed">
                            {topic.split("\n")[1]}
                          </span>
                          {/* 세 번째 줄: 두 번째 선택지 (파란색) */}
                          <span className="block text-cusBlue">
                            {topic.split("\n")[2]}
                          </span>
                        </>
                      ) : (
                        "주제를 생성해보세요!"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            className="random-topic-btn w-16 h-16 bg-cusYellowLight hover:bg-cusYellow rounded-[20px] flex items-center justify-center transition-all hover:scale-105 flex-shrink-0 random-topic-clay"
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

        <p className="text-xl font-bold mt-2 mb-6 text-center w-full">
          즐거운 배틀 되세요 !
        </p>

        <form method="dialog" className="modal-backdrop w-full flex justify-center">
          <button className="random-topic-close-btn px-6 py-2 text-md bg-btnLightBlue text-btnLightBlue-hover rounded-full hover:bg-btnLightBlue-hover hover:text-btnLightBlue text-center clay">
            닫기
          </button>
        </form>
      </div>

      <style>{`
        .random-topic-modal {
          border: none;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .random-topic-clay {
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

        .random-topic-btn {
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .random-topic-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </dialog>
  );
});

BattleRandomTopic.displayName = "BattleRandomTopic";

export default BattleRandomTopic;