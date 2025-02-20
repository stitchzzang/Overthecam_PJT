import { useRef, useState, useEffect } from 'react';
import PurchaseConfirmModal from './ShopModal/PurchaseConfirmModal';
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

function ItemListItem({ itemInfo, isPurchased, onPurchaseSuccess, myPoints }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const purchaseDialog = useRef();
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      console.log('Current audio src:', itemInfo.imageUrl);
      audioRef.current.src = itemInfo.imageUrl;
      
      const handleCanPlay = () => {
        console.log('Audio can play');
        setIsLoading(false);
      };

      const handleLoadError = (error) => {
        console.error('Audio load error:', error);
        setIsLoading(false);
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleLoadError);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleLoadError);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [itemInfo.imageUrl]);

  const onShowModal = () => {
    purchaseDialog.current.showModal();
  };

  const handlePlayPause = async () => {
    console.log('handlePlayPause clicked');
    console.log('itemInfo:', itemInfo);
    console.log('Audio source:', audioRef.current?.src);
    
    try {
      if (!audioRef.current?.src) {
        console.error('No audio source found');
        return;
      }

      if (isPlaying) {
        console.log('Trying to pause');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Trying to play');
        
        // Stop other playing audio elements
        document.querySelectorAll('audio').forEach(audio => {
          if (audio !== audioRef.current) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('Play successful');
            setIsPlaying(true);
          }
        } catch (playError) {
          console.error('Play failed:', playError);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    console.log('Audio ended');
    setIsPlaying(false);
  };

  const handlePurchaseClick = () => {
    if (!myPoints || myPoints < itemInfo.price) {
      alert('포인트가 부족합니다!');
      return;
    }
    purchaseDialog.current?.showModal();
  };

  return (
    <>
      <PurchaseConfirmModal
        ref={purchaseDialog}
        itemId={itemInfo.storeItemId}
        itemName={itemInfo.name}
        itemDetail={itemInfo.detail}
        itemImg={itemInfo.imageUrl}
        itemType={itemInfo.type}
        itemPrice={itemInfo.price}
        onPurchaseSuccess={(itemId, price) => {
          onPurchaseSuccess(itemId, price);
          window.location.reload();
        }}
      />
      <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 clay group hover:-translate-y-1">
        <div className="flex flex-col gap-2">
          {itemInfo.type === "EFFECT" ? (
            <div className="bg-cusPink rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusPink-light">
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-cusRed hover:bg-cusRed-light flex items-center justify-center text-white transition-all duration-300 shadow-md disabled:opacity-50"
                type="button"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIcon className="w-8 h-8" />
                )}
              </button>
              <audio 
                ref={audioRef}
                src={itemInfo.imageUrl}
                onEnded={handleAudioEnded}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                preload="auto"
              />
            </div>
          ) : (
            <div className="bg-cusGray rounded-lg p-4 flex justify-center items-center h-[140px] group-hover:bg-cusLightBlue-lighter">
              <img
                src={itemInfo.imageUrl || "/api/placeholder/120/120"}
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
            onClick={handlePurchaseClick}
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