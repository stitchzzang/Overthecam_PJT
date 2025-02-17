import { forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";

const BattleEndModal = forwardRef(function BattleEndModal(
  _,
  ref
) {
  const { finishBattle } = useWebSocketContext();
  const noticeToast = useRef();

  const handleClick = (e) => {
    if (e.target === ref.current) {
      ref.current.close();
    }
  };

  const onEndBattle = async () => {
    await finishBattle();
    ref.current.close();
  };

  return (
    <>
      <dialog
        ref={ref}
        onClick={handleClick}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Header */}
          <h4 className="text-xl font-bold text-cusBlack">게임 종료</h4>

          {/* Confirmation Text */}
          <h5 className="text-lg font-semibold text-cusBlack">
            정말 게임을 끝내시겠습니까?
          </h5>

          {/* Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => ref.current.close()}
              className="btn flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onEndBattle}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              종료하기
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
});

export default BattleEndModal;
