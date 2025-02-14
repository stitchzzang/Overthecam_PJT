import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";
import { useBattleStore } from "../../../store/Battle/BattleStore";
import BattleVoteCreate from "./BattleWaitingModal/BattleVoteCreateModal";
import { useRef, useState } from "react";
import BattleChating from "../common/BattleChating";
import BattleVote from "../common/BattleVote";
import BattlerSettingModal from "./BattleWaitingModal/BattlerSettingModal";

function BattleWaiting({
  room,
  localTrack,
  remoteTracks,
  participantName,
  isMaster,
  host,
  participants,
  onBattleStart,
}) {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const voteCreateModal = useRef();
  const battlerSettingModal = useRef();
  const onShowVoteCreate = (event) => {
    voteCreateModal.current.showModal();
  };

  // metadata로 내 role 보기
  try {
    const metadata = room.localParticipant.metadata
      ? JSON.parse(room.localParticipant.metadata)
      : {};
    console.log("Role:", metadata.role);
    if (metadata.role === "host") {
      setHost(battleInfo.participantName);
    }
  } catch (metadataError) {
    console.log("No metadata or invalid metadata:", metadataError);
  }

  // 6개의 고정 슬롯 생성
  const slots = Array(6)
    .fill(null)
    .map((_, index) => {
      // 첫 번째 슬롯은 로컬 트랙용
      if (index === 0 && localTrack) {
        return {
          type: "local",
          track: localTrack,
          participantName: `${participantName} (Me)`,
        };
      }

      // 나머지 슬롯에 리모트 트랙 매핑
      const remoteVideo = remoteTracks.find(
        (track) => track.trackPublication.kind === "video"
      );

      if (remoteVideo) {
        // 이미 할당된 참가자는 remoteTracks에서 제거
        remoteTracks = remoteTracks.filter((t) => t !== remoteVideo);

        return {
          type: "remote",
          track: remoteVideo.trackPublication.videoTrack,
          participantName: remoteVideo.participantIdentity,
        };
      }

      return null;
    });

  return (
    <>
      <div
        className="w-full h-full flex p-4 gap-3"
        style={{ height: "calc(100vh - 2rem)" }}
      >
        <div className="w-3/4 h-full flex flex-col">
          {/* Video grid section */}
          <div className="h-3/4 mb-4">
            <div className="grid grid-cols-3 gap-4 h-full">
              {slots.map((slot, index) => (
                <div key={index} className="flex flex-col h-full">
                  {/* Name header */}
                  <div className="px-6">
                    <div
                      className={`text-sm text-black rounded-t-lg ${
                        slot && host === slot.participantName
                          ? "bg-cusPink"
                          : "bg-cusLightBlue"
                      }`}
                    >
                      {slot ? slot.participantName : "대기중..."}
                    </div>
                  </div>
                  {/* Video container with aspect ratio */}
                  <div className="relative flex-1">
                    <div className="absolute inset-0">
                      <div className="w-full h-full">
                        {slot ? (
                          <VideoComponent
                            track={slot.track}
                            participantIdentity={slot.participantName}
                            local={slot.type === "local"}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-cusGray rounded-sm border">
                            <div className="flex flex-col items-center space-y-2">
                              <span className="text-sm text-gray-500">
                                다른 참여자 대기 중
                              </span>
                            </div>
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
            <div className="w-3/4 h-full bg-cusGray clay">
              <BattleVote isWaiting={true} />
            </div>
            {isMaster ? (
              <div className="w-1/4 flex flex-col mx-1">
                <div
                  className="h-1/2 bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg"
                  onClick={onBattleStart}
                >
                  <p>배틀 시작하기</p>
                </div>
                <div
                  onClick={onShowVoteCreate}
                  className="h-1/2 bg-cusYellow mt-1 btn flex items-center justify-center !rounded-lg"
                >
                  <p>투표 만들기</p>
                </div>
              </div>
            ) : (
              <div className="w-1/4 flex flex-col mx-1">
                <div className="h-full bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg">
                  <p>배틀 준비하기</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 flex flex-col h-full mb-5">
          <BattleChating />
        </div>
      </div>
      <BattleVoteCreate ref={voteCreateModal} />
      <BattlerSettingModal
        ref={battlerSettingModal}
        participants={participants}
      />
    </>
  );
}

export default BattleWaiting;
