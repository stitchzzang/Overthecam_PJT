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
          <div className="relative w-full aspect-[16/1] bg-gray-100 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              시청자 자리
            </div>
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
