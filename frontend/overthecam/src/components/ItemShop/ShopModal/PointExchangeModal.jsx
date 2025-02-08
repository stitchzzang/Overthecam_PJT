import { forwardRef, useRef, useState } from "react";
import { postExchangePoints } from "../../../service/ItemShop/api";
import SuccessAlertModal from "../../@common/SuccessAlertModal";
import FailAlertModal from "../../@common/FailAlertModal";

const PointExchangeModal = forwardRef(function PointExchangeModal(
  { myCheerScore, myPoints },
  ref
) {
  const [inputScore, setInputScore] = useState(null);
  const [isWrongInput, setIsWrongInput] = useState(false);
  const [convertedPoint, setConvertedPoint] = useState(null);
  const [remainingScore, setRemainingScore] = useState(null);

  const successAlertRef = useRef();
  const failAlertRef = useRef();

  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (inputValue >= 1000) {
      setInputScore(inputValue);
      setIsWrongInput(false);
    } else if (inputValue < 1000) {
      setInputScore(null);
      setIsWrongInput(true);
    }
  };

  const closeModal = () => {
    if (ref.current) {
      ref.current.close();
    }
  };

  const onExchangePoints = async (score) => {
    try {
      const response = await postExchangePoints(score);

      if (response.data) {
        setConvertedPoint(response.data.convertedPoint);
        setRemainingScore(response.data.remainingScore);
        onSuccess(convertedPoint, remainingScore);
        if (ref.current) {
          ref.current.close();
        }
        successAlertRef.current?.showAlert("환전에 성공했습니다.");
      }
    } catch (error) {
      // 현재 모달 닫기
      if (ref.current) {
        ref.current.close();
      }

      // 에러 타입에 따른 메시지 설정
      let errorMessage = "환전에 실패했습니다.";
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
      closeModal();
    }
  };

  return (
    <>
          <dialog 
      ref={ref}
      onClick={handleClick} 
      className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <h4 className="text-xl font-bold text-cusBlack text-center">포인트 전환</h4>
        
        {/* Error Message */}
        {isWrongInput && (
          <p className="text-cusRed text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
            응원점수는 1000부터 환전이 가능합니다.
          </p>
        )}
        
        {/* Current Points Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-gray-600">
            현재 보유 응원 점수 
            <span className="font-bold text-cusBlack ml-2">
              {myCheerScore.toLocaleString()}
            </span>
          </p>
          <p className="text-gray-600">
            현재 보유 포인트 
            <span className="font-bold text-cusBlack ml-2">
              {myPoints.toLocaleString()}
            </span>
          </p>
        </div>
        
        {/* Exchange Form */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label 
              htmlFor="scoreinput" 
              className="block text-sm text-gray-600 mb-1"
            >
              응원 점수
            </label>
            <input
              id="scoreinput"
              type="number"
              step={1000}
              min={0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cusRed/50 focus:border-cusRed"
            />
          </div>
          
          <span className="text-gray-400 text-xl mt-6">→</span>
          
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              포인트
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              {inputScore >= 10 ? (
                <span className="font-bold text-cusBlack">
                  {(inputScore / 10).toLocaleString()}
                </span>
              ) : (
                <span className="text-gray-400">0</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={closeModal}
            className="btn flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onExchangePoints}
            className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
          >
            전환
          </button>
        </div>
      </div>
    </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default PointExchangeModal;
