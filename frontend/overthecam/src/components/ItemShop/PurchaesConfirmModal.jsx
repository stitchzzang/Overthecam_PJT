import { forwardRef } from "react";

const PurchaesConfirmModal = forwardRef(function PurchaesConfirmModal({ itemName, itemDetail, itemImg }, ref) {
  return (
    <>
      <dialog ref={ref}>
        <h4>구매 확정</h4>
        <img src={itemImg} alt="" />
        <h5>{itemName}</h5>
        <p>{itemDetail}</p>
        <h5>해당 아이템을 구매하시겠습니까?</h5>
        <form method="dialog">
          <button>구매 확정</button>
        </form>
      </dialog>
    </>
  );
})

export default PurchaesConfirmModal;
