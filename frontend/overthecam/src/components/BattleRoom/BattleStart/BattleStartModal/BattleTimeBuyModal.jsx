import { forwardRef, useRef, useEffect } from "react";
import SuccessAlertModal from "../../../@common/SuccessAlertModal";
import FailAlertModal from "../../../@common/FailAlertModal";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";
import NoticeAlertModal from "../../../@common/NoticeAlertModal";

const TimeBuyModal = forwardRef(function TimeBuyModal(_, ref) {
  const { timeExtention, isTimeExtended } = useWebSocketContext();
  const successAlertRef = useRef();
  const noticeToast = useRef();
  const failAlertRef = useRef();

  useEffect(() => {
    if (isTimeExtended) {
      if (ref.current) {
        ref.current.close();
      }
      noticeToast.current?.showAlert("시간이 5분 추가 되었습니다.");
    }
  }, [isTimeExtended]);

  const onPurchase = async () => {
    try {
      await timeExtention();
    } catch (e) {
      if (failAlertRef.current && failAlertRef.current.showAlert) {
        failAlertRef.current.showAlert("시간 연장 요청 실패 했습니다.");
      } else {
        console.error("failAlertRef.current나 showAlert 메서드가 없습니다.");
      }
    }
  };

  const handleClick = (e) => {
    if (e.target === ref.current) {
      ref.current.close();
    }
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
          <h4 className="text-xl font-bold text-cusBlack">시간 구매</h4>

          {/* Confirmation Text */}
          <h5 className="text-lg font-semibold text-cusBlack">
            구매 시 5분이 추가 됩니다. 구매 하시겠습니까? 구매 시 300 포인트가
            차감됩니다.
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
              onClick={() => onPurchase()}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              구매 확정
            </button>
          </div>
        </div>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
      <NoticeAlertModal ref={noticeToast} />
    </>
  );
});

export default TimeBuyModal;
