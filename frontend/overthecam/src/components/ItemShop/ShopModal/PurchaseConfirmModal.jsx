import { forwardRef, useRef, useImperativeHandle } from "react";
import { postPurchase } from "../../../service/ItemShop/api";
import SuccessAlertModal from "../../@common/SuccessAlertModal";
import FailAlertModal from "../../@common/FailAlertModal";
import { useNavigate } from 'react-router-dom';

const PurchaseConfirmModal = forwardRef(function PurchaseConfirmModal(
  { itemId, itemName, itemDetail, itemImg, itemType, itemPrice, onPurchaseSuccess },
  ref
) {
  const navigate = useNavigate();
  const successAlertRef = useRef();
  const failAlertRef = useRef();
  const dialogRef = useRef();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      if (dialogRef.current) {
        dialogRef.current.showModal();
      }
    },
    close: () => {
      if (dialogRef.current) {
        dialogRef.current.close();
      }
    },
  }));

  const onPurchase = async () => {
    if (!itemId) {
      console.error("아이템 ID가 없습니다");
      return;
    }

    try {
      const response = await postPurchase(itemId);
      
      if (response.success) {
        // 모달 닫기
        if (dialogRef.current) {
          dialogRef.current.close();
        }
        
        // 성공 알림 표시
        successAlertRef.current?.showAlert("구매에 성공했습니다!");
        
        // 부모 컴포넌트에 성공 알림 (가격 정보도 함께 전달)
        if (onPurchaseSuccess) {
          onPurchaseSuccess(itemId, itemPrice);
        }

        // 여기에 새로고침 추가
        window.location.reload();
        
      } else {
        // API 응답이 success: false인 경우
        failAlertRef.current?.showAlert(response.error?.message || "구매에 실패했습니다.");
      }
    } catch (error) {
      // 네트워크 에러 등의 예외 처리
      console.error("구매 중 에러 발생:", error);
      failAlertRef.current?.showAlert(
        error.code === "ALREADY_PURCHASED_ITEM" 
          ? "이미 구매한 상품입니다."
          : error.message || "구매에 실패했습니다."
      );
    }
  };

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
      <dialog
        ref={dialogRef}
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
              onClick={() => dialogRef.current.close()}
              className="btn flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onPurchase}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              구매 확정
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
});

export default PurchaseConfirmModal;
