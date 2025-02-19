import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";
import { useBattleStore } from "../../../store/Battle/BattleStore";
import BattleVoteCreate from "./BattleWaitingModal/BattleVoteCreateModal";
import { useEffect, useRef, useState } from "react";
import BattleChating from "../common/BattleChating";
import BattleVote from "../common/BattleVote";
import PlayerReadyStatus from "./PlayerReadyStatus";
import BattlerSettingModal from "./BattleWaitingModal/BattlerSettingModal";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import useUserStore from "../../../store/User/UserStore";
import FailAlertModal from "../../@common/FailAlertModal";

function BattleWaiting({
  localTrack,
  localAudioTrack,
  remoteTracks,
  participantName,
  isMaster,
  host,
  participants,
  onShowBattlerModal,
}) {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const userId = useUserStore((state) => state.userId);
  const voteCreateModal = useRef();
  const battlerSettingModal = useRef();
  const { isVoteSubmitted, readyList, readyForBattle, myReady } =
    useWebSocketContext();

  const failToast = useRef();

  const totalParticipants = participants.length

  const onShowVoteCreate = (event) => {
    voteCreateModal.current.showModal();
  };

  useEffect(() => {}, [readyList]);

  const handleToggleReady = (e) => {
    readyForBattle(userId, participantName, !myReady);
  };

  const handleStart = (e) => {
    // 방장 ready 상태 설정 (비동기 처리)
    readyForBattle(userId, participantName, true);

    // 상태 업데이트 후 처리를 위해 setTimeout 사용
    setTimeout(() => {
      console.log("현재 참가자 수수: ", totalParticipants)
      console.log("준비한 참가자: ", readyList.length)

      if (totalParticipants <= 1) {
        failToast.current?.showAlert("혼자서 배틀을 진행할 수 없습니다.");
      }
      // // 방장 제외 모든 참가자가 준비되었는지 확인
      else if (totalParticipants >= readyList.length) {
         failToast.current?.showAlert("모든 참가자가 준비되지 않았습니다.");
      }
      else {
        onShowBattlerModal();
      }
    }, 100); // 상태 업데이트를 위한 짧은 지연
  };
  // 6개의 고정 슬롯 생성
  const slots = Array(6)
    .fill(null)
    .map((_, index) => {
      // 첫 번째 슬롯은 로컬 트랙용
      if (index === 0 && localTrack) {
        return {
          type: "local",
          track: localTrack,
          audioTrack: localAudioTrack,
          participantName: participantName,
        };
      }

      // 나머지 슬롯에 리모트 트랙 매핑
      const remoteVideo = remoteTracks.find(
        (track) => track.trackPublication.kind === "video"
      );

      if (remoteVideo) {
        // 이 참가자에 맞는 오디오 트랙 찾기
        const remoteAudio = remoteTracks.find(
          (track) =>
            track.trackPublication.kind === "audio" &&
            track.participantIdentity === remoteVideo.participantIdentity
        );
        // 이미 할당된 참가자는 remoteTracks에서 제거
        remoteTracks = remoteTracks.filter((t) => t !== remoteVideo);

        return {
          type: "remote",
          track: remoteVideo.trackPublication.videoTrack,
          audioTrack: remoteAudio?.trackPublication.audioTrack || null,
          participantName: remoteVideo.participantIdentity,
        };
      }

      return null;
    });
  return (
    <>
      <div
        className="w-full h-full flex p-4 gap-3"
        style={{
          height: "calc(100vh - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
          overflow: "hidden",
        }}
      >
        <div className="w-3/4 h-full flex flex-col">
          {/* Video grid section */}
          <div className="h-3/4 mb-4">
            <div className="grid grid-cols-3 gap-4 h-full">
              {slots.map((slot, index) => (
                <div key={index} className="flex flex-col min-h-0">
                  {/* Name header */}
                  <div className="flex-none px-6">
                    <div
                      className={`text-sm text-black rounded-t-lg ${
                        slot &&
                        host === slot.participantName.replace(" (Me)", "")
                          ? "bg-cusPink"
                          : "bg-cusLightBlue"
                      }`}
                    >
                      {slot ? slot.participantName : "대기중..."}
                    </div>
                  </div>
                  {/* Video container with fixed aspect ratio */}
                  <div className="flex-1 relative w-full">
                    <div className="absolute inset-0">
                      <div className="w-full h-full overflow-hidden">
                        {slot ? (
                          <div className="relative">
                            <div className="w-full h-full">
                              <VideoComponent
                                track={slot.track}
                                // participantIdentity={slot.participantName}
                                local={slot.type === "local"}
                                className="w-full h-full object-contain bg-black rounded-sm"
                              />
                              {slot.audioTrack && (
                                <AudioComponent
                                  track={slot.audioTrack}
                                  // participantIdentity={slot.participantName}
                                  local={slot.type === "local"}
                                />
                              )}
                              <PlayerReadyStatus
                                isReady={readyList.some(
                                  (p) => p.nickname === slot.participantName
                                )}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-cusGray rounded-sm border">
                            <span className="text-sm text-gray-500">
                              다른 참여자 대기 중
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Battle vote section */}
          <div className="h-1/4 flex gap-2">
            {isVoteSubmitted ? (
              <BattleVote isWaiting={true} />
            ) : (
              <div className=" w-full h-full bg-cusGray p-3 clay">
                <div className="p-6 bg-white w-full h-full flex items-center justify-center">
                  <p className="font-semibold text-gray-300">
                    아직 등록된 투표가 없습니다.
                  </p>
                </div>
              </div>
            )}
            {isMaster ? (
              <div className="w-1/4 flex flex-col mx-1 justify-center">
                <button
                  disabled={!isVoteSubmitted}
                  className="h-1/3 bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg disabled:bg-cusGray disabled:cursor-not-allowed"
                  onClick={handleStart}
                >
                  <p>배틀 시작하기</p>
                </button>
                <div
                  className="h-1/3 bg-cusYellow my-1 btn flex items-center justify-center !rounded-lg"
                  onClick={onShowVoteCreate}
                >
                  <p>투표 만들기</p>
                </div>
              </div>
            ) : (
              <div className="w-1/4 flex flex-col mx-1">
                <button
                  onClick={handleToggleReady}
                  disabled={!isVoteSubmitted}
                  className="h-full bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg"
                >
                  {myReady ? <p>배틀 준비취소</p> : <p>배틀 준비하기</p>}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 h-full" style={{ height: "100%" }}>
          <BattleChating />
        </div>
      </div>
      <BattleVoteCreate ref={voteCreateModal} />
      <BattlerSettingModal
        ref={battlerSettingModal}
        participants={participants}
      />
      <FailAlertModal ref={failToast} />
    </>
  );
}

export default BattleWaiting;
