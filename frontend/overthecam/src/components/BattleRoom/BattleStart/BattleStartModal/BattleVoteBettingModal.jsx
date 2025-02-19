import { forwardRef, useRef, useState } from "react";
import SuccessAlertModal from "../../../@common/SuccessAlertModal";
import FailAlertModal from "../../../@common/FailAlertModal";
import { betSupportScore } from "../../../../service/BattleRoom/api";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";

const BattleVoteBettingModal = forwardRef(function BattleVoteBettingModal(
  { battleId, optionId },
  ref
) {
  const successAlertRef = useRef();
  const failAlertRef = useRef();

  const [inputScore, setInputScore] = useState(null);
  const [isWrongInput, setIsWrongInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setMyScores } = useWebSocketContext();

 const onBet = async () => {
   if (!inputScore || isWrongInput) {
     failAlertRef.current?.showAlert("올바른 배팅 점수를 입력해주세요.");
     return;
   }

   setIsLoading(true);

   try {
     const response = await betSupportScore(battleId, optionId, inputScore);
     if (response.success && response.data) {
       // 성공적인 응답일 때만 점수 업데이트
       setMyScores({
         supportScore: response.data.supportScore,
         point: response.data.point,
       });
     }

     // 현재 모달 닫기
     if (ref.current) {
       ref.current.close();
     }

     // 성공 알림 표시
     setTimeout(() => {
       if (successAlertRef.current?.showAlert) {
         successAlertRef.current.showAlert("배팅이 완료되었습니다!");
       }
     }, 100);
   } catch (error) {
     // 에러 메시지 설정
     let errorMessage = "배팅에 실패했습니다.";

     if (error.code === "ERR_NETWORK") {
       errorMessage = "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.";
     } else if (error.code === "INSUFFICIENT_SCORE") {
       errorMessage = error.message || "보유 점수가 부족합니다.";
     } else if (error.code === "INVALID_SCORE") {
       errorMessage = "올바르지 않은 배팅 점수입니다.";
     } else if (error.message) {
       // 서버에서 전달한 에러 메시지가 있다면 사용
       errorMessage = error.message;
     }

     // 현재 모달 닫기
     if (ref.current) {
       ref.current.close();
     }

     // 실패 알림 표시 - 약간의 지연을 주어 모달 닫힘과 알림 표시 사이에 간격을 둠
     setTimeout(() => {
       if (failAlertRef.current?.showAlert) {
         failAlertRef.current.showAlert(errorMessage);
       }
     }, 100);
   } finally {
     setIsLoading(false);
   }
 };
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

  const handleClick = (e) => {
    if (e.target === ref.current) {
      ref.current.close();
    }
  };

  return (
    <>
      <dialog
        ref={ref}
        onClick={handleClick}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Header */}
          <h4 className="text-xl font-bold text-cusBlack">배팅</h4>

          {/* Error Message */}
          {isWrongInput && (
            <p className="text-cusRed text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              배팅은 1000점부터 가능합니다.
            </p>
          )}

          {/* Confirmation Text */}
          <h5 className="text-lg font-semibold text-cusBlack">
            배팅할 금액을 입력해주세요. 투표는 번복할 수 없으니 신중하게
            선택해주세요.
          </h5>

          {/* Exchange Form */}
          <div className="flex flex-col items-center gap-3">
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
                disabled={isLoading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full mt-2 justify-center">
              <button
                type="button"
                onClick={closeModal}
                className="btn px-4 py-2 w-24 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="button"
                onClick={onBet}
                className="btn px-4 py-2 w-32 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading || isWrongInput || !inputScore}
              >
                {isLoading ? "처리중..." : "배팅 확정"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default BattleVoteBettingModal;
