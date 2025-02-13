import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";
import { useBattleStore } from "../../../store/Battle/BattleStore";
import BattleVoteCreate from "./BattleWaitingModal/BattleVoteCreateModal";
import { useRef } from "react";
import BattleVote from "../common/BattleVote";
import BattlerSettingModal from "./BattleWaitingModal/BattlerSettingModal";

function BattleWaiting({
  room,
  localTrack,
  remoteTracks,
  participantName,
  isMaster,
}) {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const voteCreateModal = useRef();
  const battlerSettingModal = useRef();
  const onShowVoteCreate = (event) => {
    voteCreateModal.current.showModal();
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
          participantName: `${participantName} (Me)`,
        };
      }

      // 나머지 슬롯에 리모트 트랙 매핑
      const remoteVideo = remoteTracks.find(
        (track, trackIndex) =>
          track.trackPublication.kind === "video" && trackIndex === index - 1
      );

      if (remoteVideo) {
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
      <div className="w-full h-full flex flex-col p-4">
        <div
          className="w-full flex flex-col"
          style={{ height: "calc(100vh - 2rem)" }}
        >
          {/* Video grid section */}
          <div className="h-3/4 mb-4">
            <div className="grid grid-cols-3 gap-4 h-full">
              {slots.map((slot, index) => (
                <div key={index} className="flex flex-col h-full">
                  {/* Name header */}
                  <div className="px-6 mb-1">
                    <div
                      className={`text-sm text-black rounded-t-lg ${
                        isMaster && slot ? "bg-cusPink" : "bg-cusLightBlue"
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
          <div className="h-1/4 flex">
            <div className="w-3/4 h-full bg-cusGray mx-1 clay">
              <BattleVote isWaiting={true} />
            </div>
            {isMaster ? (
              <div className="w-1/4 flex flex-col mx-1">
                <div className="h-1/2 bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg">
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
                <div className="h-full bg-cusYellow mb-1 btn flex items-center justify-center rounded-lg">
                  <p>배틀 준비하기</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BattleVoteCreate ref={voteCreateModal} />
      <BattlerSettingModal ref={battlerSettingModal} />
    </>
  );
}

export default BattleWaiting;
