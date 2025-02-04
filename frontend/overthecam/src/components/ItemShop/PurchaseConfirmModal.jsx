import { forwardRef, useRef } from "react";
import { postPurchase } from "../../service/ItemShop/api";
import SuccessAlertModal from "../@common/SuccessAlertModal";
import FailAlertModal from "../@common/FailAlertModal";

const PurchaseConfirmModal = forwardRef(function PurchaseConfirmModal(
  { itemId, itemName, itemDetail, itemImg },
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
      if (error.code === 'ERR_NETWORK') {
        errorMessage = "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.";
      }
  
      // 실패 알림 표시 시도
      if (failAlertRef.current && failAlertRef.current.showAlert) {
        failAlertRef.current.showAlert(errorMessage);
      } else {
        console.error("failAlertRef.current나 showAlert 메서드가 없습니다.");
      }
    }
  };

  return (
    <>
      <dialog ref={ref}>
        <h4>구매 확정</h4>
        <img src={itemImg} alt="" />
        <h5>{itemName}</h5>
        <p>{itemDetail}</p>
        <h5>해당 아이템을 구매하시겠습니까?</h5>
        <button type="button" onClick={() => onPurchase(itemId)}>
          구매 확정
        </button>
        <button type="button" onClick={() => ref.current.close()}>
          취소
        </button>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default PurchaseConfirmModal;
