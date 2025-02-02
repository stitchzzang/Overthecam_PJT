import { useRef, useState } from "react";
import PurchaesConfirmModal from "./PurchaesConfirmModal";

function ItemListItem({ itemInfo }) {
  const purchaseDialog = useRef();
  const onPurchase = () => {
    purchaseDialog.current.showModal();
    // 모달 띄우기
    // 모달 확인 시
    // 구매 axios 함수
  };
  return (
    <>
      <PurchaesConfirmModal
      ref={purchaseDialog}
        itemName={itemInfo.name}
        itemDetail={itemInfo.detail}
        itemImg={itemInfo.imageURL}
      />
      <div>
        <h5>{itemInfo.name}</h5>
        <img src={itemInfo.imageURL} alt="" />
        <p>{itemInfo.detail}</p>
        <div>
          <button onClick={onPurchase}>{itemInfo.price}</button>
        </div>
      </div>
    </>
  );
}

export default ItemListItem;
