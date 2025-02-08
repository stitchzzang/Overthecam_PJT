import { useRef, useState } from 'react';
import PurchaseConfirmModal from './PurchaseConfirmModal';
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

function ItemListItem({ itemInfo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const purchaseDialog = useRef();

  const onShowModal = () => {
    purchaseDialog.current.showModal();
  };

  const handlePlay = () => {
    const audioElement = document.getElementById(`audio-player-${itemInfo.pk}`);
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const audioElement = document.getElementById(`audio-player-${itemInfo.pk}`);
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
      <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 clay group hover:-translate-y-1">
        <div className="flex flex-col gap-2">
          {itemInfo.type === "EFFECT" ? (
            <div className="bg-cusPink rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusPink-light">
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-12 h-12 rounded-full bg-cusRed hover:bg-cusRed-light flex items-center justify-center text-white transition-all duration-300 shadow-md"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIcon className="w-8 h-8" />
                )}
              </button>
              <audio 
                id={`audio-player-${itemInfo.pk}`} 
                src={itemInfo.imageURL}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <div className="bg-cusGray rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusLightBlue-lighter">
              <img
                src={itemInfo.imageURL || "/api/placeholder/120/120"}
                alt={itemInfo.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          <h5 className="text-lg font-bold text-cusBlack text-center mb-2">
            {itemInfo.name}
          </h5>
          
          <p className="text-sm text-gray-600 text-center h-12 overflow-y-auto">
            {itemInfo.detail}
          </p>
          
          <button
            onClick={onShowModal}
            className="btn mt-2 w-full py-2 px-4 bg-cusRed hover:bg-cusBlue-light text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span className="font-semibold">{itemInfo.price.toLocaleString()}</span>
            <span className="text-sm">포인트</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default ItemListItem;