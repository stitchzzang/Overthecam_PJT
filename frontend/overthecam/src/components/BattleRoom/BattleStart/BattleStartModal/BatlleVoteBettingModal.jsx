import { forwardRef, useRef, useState } from "react";
import SuccessAlertModal from "../../../@common/SuccessAlertModal";
import FailAlertModal from "../../../@common/FailAlertModal";

const BattleVoteBettingModal = forwardRef(function BattleVoteBettingModal(
  _,
  ref
) {
  const successAlertRef = useRef();
  const failAlertRef = useRef();

  const [inputScore, setInputScore] = useState(null);
  const [isWrongInput, setIsWrongInput] = useState(false);

  const onBet = async () => {
    try {
      // 베팅 api
      //   const response = await postPurchase();
      //   if (response.data) {
      //     if (ref.current) {
      //       ref.current.close();
      //     }
      //     successAlertRef.current?.showAlert("구매에 성공했습니다.");
      //   }
    } catch (error) {
      // 현재 모달 닫기
      if (ref.current) {
        ref.current.close();
      }

      // 에러 타입에 따른 메시지 설정
      let errorMessage = "배팅에 실패했습니다.";
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
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full mt-2 justify-center">
              <button
                type="button"
                onClick={closeModal}
                className="btn px-4 py-2 w-24 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => onBet()}
                className="btn px-4 py-2 w-32 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
              >
                배팅 확정
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
