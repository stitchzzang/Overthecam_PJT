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
      <div className="w-full h-full p-4 flex flex-col mt-4">
        <div className="grid grid-cols-3 grid-rows-2 gap-4 flex-1">
          {slots.map((slot, index) => (
            <div key={index} className="flex flex-col">
              {/* 참가자 이름 */}
              <div className="px-6">
                <div
                  className={`text-sm text-black rounded-t-lg ${
                    isMaster && slot ? "bg-cusPink" : "bg-cusLightBlue"
                  }`}
                >
                  {slot ? slot.participantName : "대기중..."}
                </div>
              </div>
              {/* 비디오 컨테이너 */}
              <div className="relative aspect-square rounded-sm overflow-hidden border">
                {slot ? (
                  <VideoComponent
                    track={slot.track}
                    participantIdentity={slot.participantName}
                    local={slot.type === "local"}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-cusGray">
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-sm text-gray-500">
                        다른 참여자 대기 중
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex h-1/4 mt-4">
          <div className="w-3/4 h-full bg-cusGray mx-1 clay">
            <BattleVote isWaiting={true} />
          </div>
          <div className="w-1/4 flex flex-col mx-1">
            <div className="w-full h-full bg-cusYellow mb-1 btn flex items-center justify-center !rounded-lg">
              <p>배틀 시작하기</p>
            </div>
            <div
              onClick={onShowVoteCreate}
              className="w-full h-full bg-cusYellow mt-1 btn flex items-center justify-center !rounded-lg"
            >
              <p>투표 만들기</p>
            </div>
          </div>
        </div>
      </div>
      <BattleVoteCreate ref={voteCreateModal} />
      <BattlerSettingModal ref={battlerSettingModal} />
    </>
  );
}

export default BattleWaiting;
