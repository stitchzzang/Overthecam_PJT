import { useRef, useState } from "react";
import PurchaseConfirmModal from "./PurchaseConfirmModal";

function ItemListItem({ itemInfo }) {
  const purchaseDialog = useRef();
  const onShowModal = () => {
    purchaseDialog.current.showModal();
  };
  return (
    <>
      <PurchaseConfirmModal
        ref={purchaseDialog}
        itemId={itemInfo.pk}
        itemName={itemInfo.name}
        itemDetail={itemInfo.detail}
        itemImg={itemInfo.imageURL}
      />
      <div>
        <h5>{itemInfo.name}</h5>
        <img src={itemInfo.imageURL} alt="" />
        <p>{itemInfo.detail}</p>
        <div>
          <button onClick={onShowModal}>{itemInfo.price}</button>
        </div>
      </div>
    </>
  );
}

export default ItemListItem;
