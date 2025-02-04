import { useRef, useState } from "react";
import PurchaseConfirmModal from "./PurchaseConfirmModal";

function ItemListItem({ itemInfo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const purchaseDialog = useRef();
  const onShowModal = () => {
    purchaseDialog.current.showModal();
  };
  const handlePlay = () => {
    const audioElement = document.getElementById("audio-player");
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const audioElement = document.getElementById("audio-player");
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
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
        {itemInfo.type === 1 ? (
          <div>
            <audio id="audio-player" src={itemInfo.imageURL} />
            <div>
              <button onClick={isPlaying ? handlePause : handlePlay}>
                {isPlaying ? "⏸️" : "▶️"}
              </button>
            </div>
          </div>
        ) : (
          <img src={itemInfo.imageURL} alt="" />
        )}
        <p>{itemInfo.detail}</p>
        <div>
          <button onClick={onShowModal}>{itemInfo.price}</button>
        </div>
      </div>
    </>
  );
}

export default ItemListItem;
