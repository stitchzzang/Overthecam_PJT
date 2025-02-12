import VideoComponent from "../VideoComponent";
import AudioComponent from "../AudioComponent";
import {useBattleStore}  from "../../../store/Battle/BattleStore";

function BattleWaiting({room, localTrack, remoteTracks, participantName}) {
  const battleInfo = useBattleStore((state)=> state.battleInfo)
  console.log(battleInfo.participantName);
  console.log(participantName)
    return (
      <>
        <div className="video-grid">
          {localTrack && (
            <VideoComponent
              track={localTrack}
              participantIdentity={`${participantName} (Me)`}
              local={true}
            />
          )}
          {remoteTracks.map((remoteTrack) =>
            remoteTrack.trackPublication.kind === "video" ? (
              <VideoComponent
                key={remoteTrack.trackPublication.trackSid}
                track={remoteTrack.trackPublication.videoTrack}
                participantIdentity={remoteTrack.participantIdentity}
              />
            ) : (
              <AudioComponent
                key={remoteTrack.trackPublication.trackSid}
                track={remoteTrack.trackPublication.audioTrack}
              />
            )
          )}
        </div>
      </>
    );
}

export default BattleWaiting