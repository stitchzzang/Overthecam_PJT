import { forwardRef, useRef } from "react";
import { postPurchase } from "../../../service/ItemShop/api";
import SuccessAlertModal from "../../@common/SuccessAlertModal";
import FailAlertModal from "../../@common/FailAlertModal";

const PurchaseConfirmModal = forwardRef(function PurchaseConfirmModal(
  { itemId, itemName, itemDetail, itemImg, itemType },
  ref
) {
  const successAlertRef = useRef();
  const failAlertRef = useRef();

  const onPurchase = async (itemId) => {
    try {
      const response = await postPurchase(itemId);

      if (response.data) {
        if (ref.current) {
          ref.current.close();
        }
        successAlertRef.current?.showAlert("구매에 성공했습니다.");
      }
    } catch (error) {
      // 현재 모달 닫기
      if (ref.current) {
        ref.current.close();
      }

      // 에러 타입에 따른 메시지 설정
      let errorMessage = "구매에 실패했습니다.";
      if (error.code === "ERR_NETWORK") {
        errorMessage =
          "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.";
      }

      // 실패 알림 표시 시도
      if (failAlertRef.current && failAlertRef.current.showAlert) {
        failAlertRef.current.showAlert(errorMessage);
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
          <h4 className="text-xl font-bold text-cusBlack">구매 확정</h4>

          {/* Image Container */}
          <div className="bg-cusGray rounded-lg p-4 w-full flex justify-center items-center h-[140px]">
            {itemType === "EFFECT" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
                />
              </svg>
            ) : (
              <img
                src={itemImg || "/api/placeholder/120/120"}
                alt={itemName}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Item Info */}
          <div className="w-full text-center">
            <h5 className="text-lg font-bold text-cusBlack mb-2">{itemName}</h5>
            <p className="text-sm text-gray-600 mb-4">{itemDetail}</p>
          </div>

          {/* Confirmation Text */}
          <h5 className="text-lg font-semibold text-cusBlack">
            해당 아이템을 구매하시겠습니까?
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
              onClick={() => onPurchase(itemId)}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              구매 확정
            </button>
          </div>
        </div>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default PurchaseConfirmModal;
