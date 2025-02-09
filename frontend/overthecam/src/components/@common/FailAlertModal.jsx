import { forwardRef, useImperativeHandle, useRef } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

const FailAlertModal = forwardRef(function FailAlertModal(_, ref) {
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
        
        // 3초 후 자동으로 닫히도록 설정
        setTimeout(() => {
          modalRef.current?.close();
        }, 1000);
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    }
  }));

  return (
    <dialog 
      ref={modalRef} 
      className="fixed top-6 left-1/2 -translate-x-1/2 p-0 m-0 w-96 rounded-xl shadow-xl bg-white border-2 border-red-200"
    >
      <div className="flex items-center gap-4 p-5 bg-red-50">
        <XCircleIcon className="text-error w-8 h-8 flex-shrink-0" />
        <p className="message text-base font-semibold text-gray-800 flex-grow"></p>
      </div>
    </dialog>
  );
});

export default FailAlertModal;