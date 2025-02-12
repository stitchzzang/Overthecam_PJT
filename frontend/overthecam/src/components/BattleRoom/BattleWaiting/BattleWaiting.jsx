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
    <div className="w-full h-full p-4 bg-gray-900">
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="relative aspect-video bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700"
          >
            {slot ? (
              <>
                <VideoComponent
                  track={slot.track}
                  participantIdentity={slot.participantName}
                  local={slot.type === "local"}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  {slot.participantName}
                </div>
              </>
            ) : (
              // 빈 슬롯 UI
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="flex flex-col items-center space-y-2">
                  {/* 사용자 아이콘이나 플레이스홀더 이미지 */}
                  <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">Waiting...</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BattleWaiting;
