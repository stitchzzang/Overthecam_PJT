import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { selectbattler } from "../../../../service/BattleRoom/api";
import { useBattleStore } from "../../../../store/Battle/BattleStore";
import FailAlertModal from "../../../@common/FailAlertModal";
import SuccessAlertModal from "../../../@common/SuccessAlertModal";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";

const BattlerSettingModal = forwardRef(function BattlerSettingModal(
  { participants },
  ref
) {
  const modalRef = useRef();
  const failToast = useRef();
  const sucessToast = useRef();
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const { vote, resultBattler } = useWebSocketContext();
  const [options, setOptions] = useState({
    option1: vote.option1,
    option2: vote.option2,
  });
  const [selectedBattlers, setSelectedBattlers] = useState({
    option1: "",
    option2: "",
  });

  const [participantsList, setparticipantsList] = useState(participants || []);

  const handleBattlerSelect = (optionKey, participantId) => {
    setSelectedBattlers((prev) => ({
      ...prev,
      [optionKey]: participantId,
    }));
  };

  useEffect(() => {
    if (Array.isArray(participants)) {
      const validParticipants = participants.filter(
        (p) => p && (p.id || p.nickname)
      );
      setparticipantsList(validParticipants);
    }
  }, [participants]);

  useImperativeHandle(ref, () => ({
    showModal: (option1, option2) => {
      try {
        modalRef.current?.showModal();
        setOptions({ option1, option2 });
        setSelectedBattlers({ option1: null, option2: null });
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedBattlers.option1 || !selectedBattlers.option2) {
        throw new Error("각 선택지마다 배틀러를 선택해주세요.");
      }

      if (selectedBattlers.option1 === selectedBattlers.option2) {
        throw new Error("같은 참가자를 양쪽 배틀러로 선택할 수 없습니다.");
      }

      const response = await selectbattler(
        battleInfo.battleId,
        selectedBattlers.option1,
        selectedBattlers.option2,
        vote.option1Id,
        vote.option2Id
      );
      console.log(response.data);
      modalRef.current?.close();
      sucessToast.current?.showAlert("배틀러가 선정 되었습니다.");
      setTimeout(resultBattler(), 1500);
    } catch (error) {
      console.error("배틀러 선정 중 에러:", error);
      failToast.current?.showAlert(
        error.message || "배틀러를 선정하지 못했습니다."
      );
    }
  };

  const isParticipantSelected = (participantId, currentOption) => {
    const otherOption = currentOption === "option1" ? "option2" : "option1";
    return selectedBattlers[otherOption] === participantId;
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
              <h2 className="text-lg font-semibold mb-4">
                선택지 1 {options.option1}
              </h2>
              <select
                value={selectedBattlers.option1}
                onChange={(e) => handleBattlerSelect("option1", e.target.value)}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-cusYellow focus:border-cusYellow"
              >
                <option value="">배틀러 선택</option>
                {participantsList.map((participant) => (
                  <option
                    key={`option1-${
                      participant.userId || participant.nickname
                    }`}
                    value={participant.userId} // userId 사용
                    disabled={isParticipantSelected(
                      participant.userId,
                      "option1"
                    )}
                  >
                    {participant.nickname}
                    {isParticipantSelected(participant.userId, "option1")
                      ? " (선택지 2에서 선택됨)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 선택지 2 */}
            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">
                선택지 2 {options.option2}
              </h2>
              <select
                value={selectedBattlers.option2}
                onChange={(e) => handleBattlerSelect("option2", e.target.value)}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-cusYellow focus:border-cusYellow"
              >
                <option value="">배틀러 선택</option>
                {participantsList.map((participant) => (
                  <option
                    key={`option2-${
                      participant.userId || participant.nickname
                    }`}
                    value={participant.userId} // userId 사용
                    disabled={isParticipantSelected(
                      participant.userId,
                      "option2"
                    )}
                  >
                    {participant.nickname}
                    {isParticipantSelected(participant.userId, "option2")
                      ? " (선택지 1에서 선택됨)"
                      : ""}
                  </option>
                ))}
              </select>
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
      <SuccessAlertModal ref={sucessToast} />
    </>
  );
});

export default BattlerSettingModal;
