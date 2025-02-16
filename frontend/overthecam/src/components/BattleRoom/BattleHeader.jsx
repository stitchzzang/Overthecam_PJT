import { useRef } from "react";
import { useBattleStore } from "../../store/Battle/BattleStore";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import BattleTimer from "./BattleStart/BattleTimer";
import NoticeAlertModal from "../@common/NoticeAlertModal";
import BattleRandomTopic from "./BattleWaiting/BattleWaitingModal/BattleRandomTopic";
import { useWebSocketContext } from "../../hooks/useWebSocket";

function BattleHeader({
  isWaiting,
  isMaster,
  onshowLeaveConfirmModal,
  onShowEndBattleModal,
}) {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const noticeToast = useRef();
  const randomTopicModal = useRef();

  const handleTimerStoped = (message) => {
    noticeToast.current?.showAlert(message);
  };

  const onShowRandomTopic = () => {
    randomTopicModal.current?.showModal();
  };

  return (
    <>
      <div className="room-header flex items-center w-full h-16 bg-cusGray p-3 rounded-xl">
        {/* 왼쪽 영역 */}
        <div className="room-leave-controll flex gap-2">
          <button
            onClick={onshowLeaveConfirmModal}
            className="btn justify-start bg-cusLightBlue-light !rounded-xl flex items-center h-12"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            나가기
          </button>
          {!isWaiting && isMaster ? (
            <button
              onClick={onShowEndBattleModal}
              className="btn justify-start bg-cusYellow !rounded-xl flex items-center h-12"
            >
              배틀 종료
            </button>
          ) : null}
        </div>

        {/* 중앙 영역 */}
        <div className="room-header-name mx-auto text-2xl font-semibold max-w-[40%]">
          <h2 className="truncate">{battleInfo.roomName}</h2>
        </div>

        {/* 오른쪽 영역 */}
        {isWaiting ? (
          <div className="flex gap-3">
            <button
              className="random-subject btn bg-cusPink !rounded-xl flex items-center h-12"
              onClick={onShowRandomTopic}
            >
              랜덤 주제 생성기
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="battle-timer flex bg-cusYellow rounded-xl items-center h-12 clay">
              <BattleTimer onTimerStoped={handleTimerStoped} />
            </div>
            <div className="my-points flex bg-gray-300 rounded-xl items-center h-12 clay gap-2 px-2 font-semibold">
              <span>내 포인트</span>
              <div className="points bg-white rounded-lg px-1">100</div>
              <span>내 응원 점수</span>
              <div className="cheer-score bg-white rounded-lg px-1">1000</div>
            </div>
          </div>
        )}
      </div>
      <NoticeAlertModal ref={noticeToast} />
      <BattleRandomTopic ref={randomTopicModal} />
    </>
  );
}

export default BattleHeader;
