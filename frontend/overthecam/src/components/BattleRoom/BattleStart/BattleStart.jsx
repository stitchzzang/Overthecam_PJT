import BattleVote from "../common/BattleVote";
import BattleChating from "../common/BattleChating";
import { useState } from "react";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";

function BattleStart({ remoteTracks, localTrack, participantName }) {
  const { battlers } = useWebSocketContext();

  const battler1 = (() => {
    // 현재 참가자가 배틀러1인 경우
    if (battlers[0].nickname === participantName) {
      return {
        type: "local",
        track: localTrack,
        participantName: participantName,
      };
    }
    // 다른 참가자가 배틀러1인 경우
    else {
      const battler1Track = remoteTracks.filter(
        (t) => t.participantIdentity === battlers[0].nickname
      );
      const battler1Video = battler1Track.find(
        (track) => track.trackPublication.kind === "video"
      );
      const battler1Audio = battler1Track.find(
        (track) => track.trackPublication.kind === "audio"
      );

      if (battler1Video) {
        remoteTracks = remoteTracks.filter((t) => t !== battler1Video);
        return {
          type: "remote",
          track: battler1Video.trackPublication.videoTrack,
          audioTrack: battler1Audio?.trackPublication.audioTrack,
          participantName: battler1Video.participantIdentity,
        };
      }
    }
    return null; // 해당하는 트랙이 없는 경우
  })();

  const battler2 = (() => {
    // 현재 참가자가 배틀러2인 경우
    if (battlers[1].nickname === participantName) {
      return {
        type: "local",
        track: localTrack,
        participantName: participantName,
      };
    }
    // 다른 참가자가 배틀러1인 경우
    else {
      const battler2Track = remoteTracks.filter(
        (t) => t.participantIdentity === battlers[1].nickname
      );
      const battler2Video = battler2Track.find(
        (track) => track.trackPublication.kind === "video"
      );
      const battler2Audio = battler2Track.find(
        (track) => track.trackPublication.kind === "audio"
      );

      if (battler2Video) {
        remoteTracks = remoteTracks.filter((t) => t !== battler2Video);
        return {
          type: "remote",
          track: battler2Video.trackPublication.videoTrack,
          audioTrack: battler2Audio?.trackPublication.audioTrack,
          participantName: battler2Video.participantIdentity,
        };
      }
    }
    return null; // 해당하는 트랙이 없는 경우
  })();

  const watcherSlots = Array(4)
    .fill(null)
    .map((_, index) => {
      // 첫 번째 슬롯이고 현재 사용자가 배틀러가 아닌 경우 로컬 트랙 할당
      if (
        index === 0 &&
        localTrack &&
        !battlers.some((battler) => battler.nickname === participantName)
      ) {
        return {
          type: "local",
          track: localTrack,
          participantName: participantName,
        };
      }

      // 이미 할당된 시청자들의 participantIdentity 목록
      const assignedWatchers = watcherSlots
        .slice(0, index)
        .filter(Boolean)
        .map((slot) => slot.participantName);

      // 아직 할당되지 않은 시청자 중에서 비디오 트랙 찾기
      const watcherVideo = remoteTracks.find((track) => {
        const isNotBattler = !battlers.some(
          (battler) => battler.nickname === track.participantIdentity
        );
        const isNotAssigned = !assignedWatchers.includes(
          track.participantIdentity
        );
        return (
          track.trackPublication.kind === "video" &&
          isNotBattler &&
          isNotAssigned
        );
      });

      if (watcherVideo) {
        const watcherAudio = remoteTracks.find(
          (track) =>
            track.participantIdentity === watcherVideo.participantIdentity &&
            track.trackPublication.kind === "audio"
        );

        return {
          type: "remote",
          track: watcherVideo.trackPublication.videoTrack,
          audioTrack: watcherAudio?.trackPublication.audioTrack,
          participantName: watcherVideo.participantIdentity,
        };
      }
      return null;
    });

  return (
    <div className="battle-start-container w-full">
      <div className="battle-start-content max-w-7xl mx-auto">
        {/* 비디오 섹션 */}
        <div className="battler-section mx-5 my-3 h-[45vh]">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* 배틀러 1 */}
            <div className="flex flex-col">
              <div className="text-sm text-black rounded-t-lg p-1.5 bg-cusRed-light clay">
                {battlers[0].nickname}
                <div className="relative w-full aspect-[4/3] bg-cusGray">
                  <div className="absolute inset-0 border rounded-lg flex items-center justify-center">
                    <VideoComponent
                      track={battler1.track}
                      participantIdentity={battler1.participantName}
                      local={battler1.type === "local"}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 채팅 */}
            <div className="flex flex-col items-center justify-start">
              <div className="w-full h-full">
                <BattleChating />
              </div>
            </div>

            {/* 배틀러 2 */}
            <div className="flex flex-col">
              <div className="text-sm text-black rounded-t-lg p-1.5 bg-cusBlue-light clay">
                {battlers[1].nickname}
                <div className="relative w-full aspect-[4/3] bg-cusGray">
                  <div className="absolute inset-0 border rounded-lg flex items-center justify-center">
                    <VideoComponent
                      track={battler2.track}
                      participantIdentity={battler2.participantName}
                      local={battler2.type === "local"}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 시청자 섹션 */}
        <div className="watcher-section mx-5">
          <div className="grid grid-cols-4 gap-4">
            {watcherSlots.map((slot, index) => (
              <div
                key={index}
                className="relative aspect-video bg-cusGray rounded-lg"
              >
                {slot ? (
                  <div className="absolute inset-0">
                    <VideoComponent
                      track={slot.track}
                      participantIdentity={slot.participantName}
                      local={slot.type === "local"}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    {slot.audioTrack && (
                      <AudioComponent
                        track={slot.audioTrack}
                        participantIdentity={slot.participantName}
                      />
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500">빈 자리</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 투표 섹션 */}
        <div className="vote-section mx-5 my-3">
          <div className="relative w-full aspect-[16/2.5] bg-cusGray rounded-lg clay">
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <BattleVote isWaiting={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleStart;
