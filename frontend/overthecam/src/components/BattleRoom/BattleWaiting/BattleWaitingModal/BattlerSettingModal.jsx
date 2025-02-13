import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FailAlertModal from "../../../@common/FailAlertModal";

const BattlerSettingModal = forwardRef(function BattlerSettingModal(_, ref) {
  const modalRef = useRef();
  const failToast = useRef();

  const [options, setOptions] = useState({ option1: '', option2: '' });
  const [battlers, setBattlers] = useState({
    option1: null,
    option2: null
  });

  const [participants, setParticipants] = useState([
    { id: 1, participantName: "우끼끼 정해기" },
    { id: 2, participantName: "빽다방구라치노" },
    { id: 3, participantName: "우르르롹끼" },
    { id: 4, participantName: "붐샤카라카" },
  ]);

  const isParticipantSelected = (participantId) => {
    return battlers.option1 === participantId || battlers.option2 === participantId;
  };

  const isParticipantDisabled = (optionKey, participantId) => {
    const otherOptionKey = optionKey === 'option1' ? 'option2' : 'option1';
    return isParticipantSelected(participantId) && battlers[optionKey] !== participantId;
  };

  const handleBattlerSelect = (optionKey, participantId) => {
    setBattlers(prev => ({
      ...prev,
      [optionKey]: prev[optionKey] === participantId ? null : participantId
    }));
  };

  useImperativeHandle(ref, () => ({
    showModal: (option1, option2) => {
      try {
        modalRef.current?.showModal();
        setOptions({ option1, option2 });
        setBattlers({ option1: null, option2: null });
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!battlers.option1 || !battlers.option2) {
        throw new Error("각 선택지마다 배틀러를 선택해주세요.");
      }

      if (battlers.option1 === battlers.option2) {
        throw new Error("같은 참가자를 양쪽 배틀러로 선택할 수 없습니다.");
      }

      // API 호출 로직...
      // const response = await fetch('/api/battlers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(battlers),
      // });

      // if (!response.ok) {
      //   throw new Error("배틀러 선정 중 오류가 발생했습니다.");
      // }

      modalRef.current?.close();
    } catch (error) {
      console.error("배틀러 선정 중 에러:", error);
      failToast.current?.showAlert(error.message || "배틀러를 선정하지 못했습니다.");
    }
  };

  return (
    <>
      <dialog
        ref={modalRef}
        className="rounded-xl shadow-2xl p-6 w-full max-w-4xl backdrop:bg-black/50 backdrop:backdrop-blur-sm z-50"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-cusBlack text-center">
            배틀러 선정
          </h1>

          <div className="flex gap-6">
            {/* 선택지 1 */}
            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">선택지 1 {options.option1}</h2>
              <div className="space-y-3">
                {participants.map((participant) => {
                  const isDisabled = isParticipantDisabled('option1', participant.id);
                  return (
                    <label
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-white 
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'} 
                        transition-all duration-300`}
                    >
                      <input
                        type="radio"
                        name="option1"
                        checked={battlers.option1 === participant.id}
                        onChange={() => handleBattlerSelect('option1', participant.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 border-gray-300 text-cusYellow focus:ring-cusYellow
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${isDisabled ? 'opacity-50' : ''}`}>
                        {participant.participantName}
                        {isParticipantSelected(participant.id) && battlers.option2 === participant.id && 
                          <span className="ml-2 text-sm text-blue-600">(선택지 2 배틀러)</span>
                        }
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 선택지 2 */}
            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">선택지 2 {options.option2}</h2>
              <div className="space-y-3">
                {participants.map((participant) => {
                  const isDisabled = isParticipantDisabled('option2', participant.id);
                  return (
                    <label
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-white 
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'} 
                        transition-all duration-300`}
                    >
                      <input
                        type="radio"
                        name="option2"
                        checked={battlers.option2 === participant.id}
                        onChange={() => handleBattlerSelect('option2', participant.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 border-gray-300 text-cusYellow focus:ring-cusYellow
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${isDisabled ? 'opacity-50' : ''}`}>
                        {participant.participantName}
                        {isParticipantSelected(participant.id) && battlers.option1 === participant.id && 
                          <span className="ml-2 text-sm text-blue-600">(선택지 1 배틀러)</span>
                        }
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-2">
            <button
              type="button"
              onClick={() => modalRef.current?.close()}
              className="py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold clay"
            >
              취소
            </button>
            <button
              type="submit"
              className="py-2 px-6 bg-cusRed hover:bg-cusPink text-white rounded-lg transition-all duration-300 font-semibold clay"
            >
              확인
            </button>
          </div>
        </form>
      </dialog>
      <FailAlertModal ref={failToast} />
    </>
  );
});

export default BattlerSettingModal;