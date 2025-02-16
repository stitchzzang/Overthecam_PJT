import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FailAlertModal from "../../../@common/FailAlertModal";
import { useBattleStore } from "../../../../store/Battle/BattleStore";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";

const BattleVoteCreateModal = forwardRef(function BattleVoteCreateModal(
  _,
  ref
) {
  const modalRef = useRef();
  const failToast = useRef();
  const { createVote } = useWebSocketContext();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    option1: "",
    option2: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useImperativeHandle(ref, () => ({
    showModal: () => {
      try {
        modalRef.current?.showModal();
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 유효성 검사
      if (
        !formData.title.trim() ||
        !formData.option1.trim() ||
        !formData.option2.trim()
      ) {
        throw new Error("필수 항목을 모두 입력해주세요.");
      }

      const options = [formData.option1, formData.option2];

      createVote(formData.title, formData.content, options);

      // 성공 시 모달 닫기
      modalRef.current?.close();
      // 폼 초기화
      setFormData({
        title: "",
        content: "",
        option1: "",
        option2: "",
      });
    } catch (error) {
      console.error("투표 생성 중 에러:", error);
      if (modalRef.current) {
        modalRef.current.close();
      }
      if (failToast.current && failToast.current.showAlert) {
        failToast.current?.showAlert("투표를 생성하지 못했습니다.");
      } else {
        console.error("failAlertRef.current나 showAlert 메서드가 없습니다.");
      }
    }
  };

  return (
    <>
      <dialog
        ref={modalRef}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm z-50"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-cusBlack text-center">
            투표 생성
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm self-start px-2 font-semibold text-cusBalck-light">
                투표 제목
              </p>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cusYellow"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm self-start px-2 font-semibold text-cusBalck-light">
                설명
              </p>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-cusYellow"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm self-start px-2 font-semibold text-cusBalck-light">
                선택지 1
              </p>
              <input
                type="text"
                name="option1"
                value={formData.option1}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cusPink"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm self-start px-2 font-semibold text-cusBalck-light">
                선택지 2
              </p>
              <input
                type="text"
                name="option2"
                value={formData.option2}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cusLightBlue"
                required
              />
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => modalRef.current?.close()}
                className="clay flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="clay flex-1 py-2 px-4 bg-cusRed-light hover:bg-cusRed text-white rounded-lg transition-all duration-300 font-semibold"
              >
                확인
              </button>
            </div>
          </form>
        </div>
      </dialog>
      <FailAlertModal ref={failToast} />
    </>
  );
});

export default BattleVoteCreateModal;
