import BattleVote from "../common/BattleVote";
import BattleChating from "../common/BattleChating";
import { useState } from "react";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";

function BattleStart({ remoteTracks, localTrack, participantName }) {
  const { battlers } = useWebSocketContext();
  let remainingTracks = [...remoteTracks]; // remoteTracks 복사본 생성

  // 배틀러1 처리
  const battler1 = (() => {
    if (battlers[0].nickname === participantName) {
      return {
        type: "local",
        track: localTrack,
        participantName: participantName,
      };
    }

    const battler1Track = remainingTracks.filter(
      (t) => t.participantIdentity === battlers[0].nickname
    );
    const battler1Video = battler1Track.find(
      (track) => track.trackPublication.kind === "video"
    );
    const battler1Audio = battler1Track.find(
      (track) => track.trackPublication.kind === "audio"
    );

    if (battler1Video) {
      // 사용된 트랙 제거
      remainingTracks = remainingTracks.filter(
        (t) => t !== battler1Video && t !== battler1Audio
      );
      return {
        type: "remote",
        track: battler1Video.trackPublication.videoTrack,
        audioTrack: battler1Audio?.trackPublication.audioTrack,
        participantName: battler1Video.participantIdentity,
      };
    }
    return null;
  })();

  // 배틀러2 처리
  const battler2 = (() => {
    if (battlers[1].nickname === participantName) {
      return {
        type: "local",
        track: localTrack,
        participantName: participantName,
      };
    }

    const battler2Track = remainingTracks.filter(
      (t) => t.participantIdentity === battlers[1].nickname
    );
    const battler2Video = battler2Track.find(
      (track) => track.trackPublication.kind === "video"
    );
    const battler2Audio = battler2Track.find(
      (track) => track.trackPublication.kind === "audio"
    );

    if (battler2Video) {
      // 사용된 트랙 제거
      remainingTracks = remainingTracks.filter(
        (t) => t !== battler2Video && t !== battler2Audio
      );
      return {
        type: "remote",
        track: battler2Video.trackPublication.videoTrack,
        audioTrack: battler2Audio?.trackPublication.audioTrack,
        participantName: battler2Video.participantIdentity,
      };
    }
    return null;
  })();

  // 시청자 슬롯 처리 (4개 고정)
  const watcherSlots = Array(4)
    .fill(null)
    .map((_, index) => {
      // 첫 번째 슬롯에서 현재 사용자가 배틀러가 아닌 경우 로컬 트랙 할당
      if (
        index === 0 &&
        !battlers.some((battler) => battler.nickname === participantName) &&
        localTrack
      ) {
        return {
          type: "local",
          track: localTrack,
          participantName: participantName,
        };
      }

      // 남은 트랙 중에서 비디오 트랙 찾기
      const watcherVideo = remainingTracks.find(
        (track) =>
          track.trackPublication.kind === "video" &&
          !battlers.some(
            (battler) => battler.nickname === track.participantIdentity
          )
      );

      if (watcherVideo) {
        const watcherAudio = remainingTracks.find(
          (track) =>
            track.participantIdentity === watcherVideo.participantIdentity &&
            track.trackPublication.kind === "audio"
        );

        // 사용된 트랙 제거
        remainingTracks = remainingTracks.filter(
          (t) => t !== watcherVideo && t !== watcherAudio
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
        {/* 배틀러 섹션 */}
        <div className="battler-section mx-5 my-3 h-[45vh]">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* 배틀러 1 */}
            <div className="flex flex-col">
              <div className="text-sm text-black rounded-t-lg p-1.5 bg-cusRed-light clay">
                {battlers[0].nickname}
                <div className="relative w-full aspect-[4/3] bg-cusGray">
                  <div className="absolute inset-0 border rounded-lg flex items-center justify-center">
                    {battler1 && (
                      <VideoComponent
                        track={battler1.track}
                        participantIdentity={battler1.participantName}
                        local={battler1.type === "local"}
                        className="w-full h-full object-cover rounded-sm"
                      />
                    )}
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
                    {battler2 && (
                      <VideoComponent
                        track={battler2.track}
                        participantIdentity={battler2.participantName}
                        local={battler2.type === "local"}
                        className="w-full h-full object-cover rounded-sm"
                      />
                    )}
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
