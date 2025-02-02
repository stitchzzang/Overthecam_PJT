import { forwardRef, useImperativeHandle, useRef } from "react";

const SuccessAlertModal = forwardRef(function SuccessAlertModal(_, ref) {
 const modalRef = useRef();
  
  useImperativeHandle(ref, () => ({
    showAlert: (message) => {
      console.log("showAlert 호출됨, message:", message);
      if (!modalRef.current) {
        console.error("modalRef.current가 없음");
        return;
      }
      try {
        modalRef.current.querySelector(".message").textContent = message;
        modalRef.current.showModal();
        console.log("모달 표시 완료");
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    }
  }));

  return (
    <dialog 
      ref={modalRef} 
      className="success-alert-modal"
    >
      <p 
        className="message" 
      ></p>
      <button 
        type="button" 
        onClick={() => modalRef.current?.close()}
      >
        확인
      </button>
    </dialog>
  );
});

export default SuccessAlertModal;
