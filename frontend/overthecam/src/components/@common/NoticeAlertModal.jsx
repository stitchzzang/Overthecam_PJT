import { forwardRef, useImperativeHandle, useRef } from "react";
import { MegaphoneIcon } from "@heroicons/react/24/outline";

const NoticeAlertModal = forwardRef(function NoticeAlertModal(_, ref) {
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

        setTimeout(() => {
          modalRef.current?.close();
        }, 3000);
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    },
  }));

  const handleClick = (e) => {
    if (e.target === modalRef.current) {
      modalRef.current.close();
    }
  };

  return (
    <dialog
      ref={modalRef}
      onClick={handleClick}
      className="fixed top-6 left-1/2 -translate-x-1/2 p-0 m-0 w-96 rounded-xl shadow-xl bg-white border-2 border-blue-200"
    >
      <div className="flex items-center gap-4 p-5 bg-blue-50">
        <MegaphoneIcon className="text-green-500 w-8 h-8 flex-shrink-0" />
        <p className="message text-base font-medium text-gray-800"></p>
      </div>
    </dialog>
  );
});

export default NoticeAlertModal;
