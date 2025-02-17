import { forwardRef, useState, useEffect, useRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";

const BattleResultModal = forwardRef(function BattleResultModal(
  { onFinish },
  ref
) {
  const { myResult, isDraw, gameResult } = useWebSocketContext();
  const navigate = useNavigate();
  const [options, setOptions] = useState([
    { percentage: 0 },
    { percentage: 0 },
  ]);
  const dialogRef = useRef(null); // 내부 ref 추가

  useEffect(() => {
    if (gameResult?.options?.length > 0) {
      setOptions(gameResult.options);
    }
  }, [gameResult]);

  // useImperativeHandle을 통해 외부에서 사용할 메서드 노출
  useImperativeHandle(ref, () => ({
    showAlert: () => {
      dialogRef.current?.showModal();
    },
  }));
  

  // gameResult가 없을 때의 처리 추가
  if (!gameResult || !gameResult.options) {
    return null; // 또는 로딩 상태를 보여줄 수 있습니다
  }

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const onLeaveRoom = async () => {
    dialogRef.current.close();
    if (onFinish) {
      await onFinish(); // cleanup + 배틀 종료 요청
    }
    setTimeout(navigate("/main/battle-list"), 1000);
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onClick={handleClick}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Header */}
          <h4 className="text-xl font-bold text-cusBlack">게임 종료</h4>

          {/* 투표 결과 그래프 */}
          <div className="relative h-12 clay bg-gray-200 rounded-full overflow-hidden mb-8">
            <div className="text-lg font-semibold text-cusBlack absolute left-1/2 -translate-x-1/2 z-10">
              {gameResult.battleTitle}
            </div>
            <div className="flex h-full w-full">
              <div
                className="h-full clay bg-red-400 flex items-center justify-start pl-4 text-white font-bold transition-all duration-300"
                style={{
                  width: `${options[0]?.percentage || 50}%`,
                }}
              >
                {options[0]?.percentage || 0}%
              </div>
              <div
                className="h-full clay bg-blue-400 flex items-center justify-end pr-4 text-white font-bold transition-all duration-300"
                style={{
                  width: `${options[1]?.percentage || 50}%`,
                }}
              >
                {options[1]?.percentage || 0}%
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          {isDraw ? (
            <>
              <h5 className="text-lg font-semibold text-cusBlack">
                게임이 무승부로 끝났습니다.
              </h5>
              <h5 className="text-lg font-semibold text-cusBlack">
                응원 점수를 획득하지 못했습니다.
              </h5>
            </>
          ) : (
            <>
              <h5 className="text-lg font-semibold text-cusBlack">
                {myResult.nickname} 님은 {myResult.winner ? "승리" : "패배"}{" "}
                하셨습니다.
              </h5>
              <h5 className="text-lg font-semibold text-cusBlack">
                응원 점수 {myResult.resultScore} 점을 획득 하셨습니다.
              </h5>
            </>
          )}

          {/* Buttons */}
          <div className="flex w-full mt-2 justify-center">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
});

export default BattleResultModal;
