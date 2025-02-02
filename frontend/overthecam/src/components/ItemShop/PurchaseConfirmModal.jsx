import { forwardRef } from "react";
import { postPurchase } from "../../service/ItemShop/api";

const PurchaseConfirmModal = forwardRef(function PurchaseConfirmModal(
  { itemId, itemName, itemDetail, itemImg },
  ref
) {
  const onPurchase = async (itemId) => {
    try {
      const response = await postPurchase(itemId);
      console.log("구매 성공:", response);

      if (ref.current) {
        ref.current.close();
      }
    } catch (error) {
      console.error("구매 실패:", error);
    }
  };

  return (
    <dialog ref={ref}>
      <h4>구매 확정</h4>
      <img src={itemImg} alt="" />
      <h5>{itemName}</h5>
      <p>{itemDetail}</p>
      <h5>해당 아이템을 구매하시겠습니까?</h5>
      <button type="button" onClick={() => onPurchase(itemId)}>
        구매 확정
      </button>
    </dialog>
  );
});

export default PurchaseConfirmModal;
