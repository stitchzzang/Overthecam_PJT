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
  return (
    <>
      <dialog ref={ref}>
        <h4>포인트 전환</h4>
        {isWrongInput && (
          <p style={{ color: "red" }}>응원점수는 1000부터 환전이 가능합니다.</p>
        )}
        <p>현재 보유 응원 점수 {myCheerScore}</p>
        <p>현재 보유 포인트 {myPoints}</p>
        <label htmlFor="scoreinput">응원 점수</label>
        <input type="number" step={1000} min={0} onChange={handleChange} />
        <span>→</span>
        <label>포인트</label>
        {inputScore >= 10 ? <span>{inputScore / 10}</span> : <span>0</span>}
        <div>
          <button onClick={closeModal}>취소</button>
          <button onClick={onExchangePoints}>전환</button>
        </div>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default PointExchangeModal;
