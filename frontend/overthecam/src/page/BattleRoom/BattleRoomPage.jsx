import { Room, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import VideoComponent from "../../components/BattleRoom/VideoComponent";
import AudioComponent from "../../components/BattleRoom/AudioComponent";
import BattleChating from "../../components/BattleRoom/BattleChating";
import BattleTimer from "../../components/BattleRoom/BattleTimer";
import axios from "axios";

const APPLICATION_SERVER_URL = import.meta.env.VITE_BASE_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

function BattleRoomPage() {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const clearBattleInfo = useBattleStore((state) => state.clearBattleInfo);
  const { roomName, participantName } = battleInfo;
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);

  useEffect(() => {
    async function checkMediaPermissions() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Media permissions granted");
      } catch (error) {
        console.error("Media permissions denied:", error);
      }
    }

    if (roomName && participantName) {
      checkMediaPermissions();
      joinRoom();
    }

    return () => {
      leaveRoom();
    };
  }, [roomName, participantName]);

  async function joinRoom() {
    console.log("Starting joinRoom with:", {
      roomName,
      participantName,
      LIVEKIT_URL,
    });
    const room = new Room();
    setRoom(room);

    room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
      console.log(
        "New track subscribed:",
        publication.kind,
        participant.identity
      );
      setRemoteTracks((prev) => [
        ...prev,
        {
          trackPublication: publication,
          participantIdentity: participant.identity,
        },
      ]);
    });

    room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks((prev) =>
        prev.filter(
          (track) => track.trackPublication.trackSid !== publication.trackSid
        )
      );
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("Participant disconnected:", participant.identity);
      setRemoteTracks((prev) =>
        prev.filter(
          (track) => track.participantIdentity !== participant.identity
        )
      );
    });

    try {
      const token = await getToken(roomName, participantName);
      console.log("Received token:", token);

      await room.connect(LIVEKIT_URL, token);
      console.log("Room connected successfully");

      await room.localParticipant.enableCameraAndMicrophone();
      console.log("Camera and mic enabled");

      const videoTrack = room.localParticipant.videoTrackPublications
        .values()
        .next().value?.videoTrack;

      if (videoTrack) {
        console.log("Video track obtained:", videoTrack);
        setLocalTrack(videoTrack);
      } else {
        console.warn("No video track available");
      }
    } catch (error) {
      console.error("Room connection error:", error);
      await leaveRoom();
    }
  }

  async function leaveRoom() {
    await room?.disconnect();
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
    clearBattleInfo();
    navigate("/");
  }

  async function getToken(roomTitle, participantName) {
    if (!roomTitle || !participantName) {
      throw new Error("Room title and participant name are required");
    }

    try {
      const response = await axios.post(
        APPLICATION_SERVER_URL + "/token",
        {
          roomName: roomTitle,
          participantName: participantName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      console.log("Token Response:", response.data);
      return response.data.token;
    } catch (error) {
      console.error("Token Request Error:", error.response?.data || error);
      throw error;
    }
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <h2>{roomName}</h2>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>
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
      <BattleChating />
    </div>
  );
}

export default BattleRoomPage;
