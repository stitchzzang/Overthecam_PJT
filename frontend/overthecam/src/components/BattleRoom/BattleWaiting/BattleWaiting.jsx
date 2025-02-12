import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";
import { useBattleStore } from "../../../store/Battle/BattleStore";

function BattleWaiting({ room, localTrack, remoteTracks, participantName }) {
  const battleInfo = useBattleStore((state) => state.battleInfo);

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
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        {slots.map((slot, index) => (
          <div key={index} className="flex flex-col">
            {/* 참가자 이름 */}
            <div className="text-sm mb-1 text-black">
              {slot ? slot.participantName : "대기중..."}
            </div>
            {/* 비디오 컨테이너 */}
            <div className="relative aspect-video rounded-sm overflow-hidden border">
              {slot ? (
                <VideoComponent
                  track={slot.track}
                  participantIdentity={slot.participantName}
                  local={slot.type === "local"}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
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
    </div>
  );
}

export default BattleWaiting;
