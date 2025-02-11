import { Room, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import VideoComponent from "../../components/BattleRoom/VideoComponent";
import AudioComponent from "../../components/BattleRoom/AudioComponent";
import BattleChating from "../../components/BattleRoom/common/BattleChating";
import BattleTimer from "../../components/BattleRoom/BattleStart/BattleTimer";
import axios from "axios";
import BattleWaiting from "../../components/BattleRoom/BattleWaiting/BattleWaiting";

const APPLICATION_SERVER_URL = import.meta.env.VITE_BASE_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

function BattleRoomPage() {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const clearBattleInfo = useBattleStore((state) => state.clearBattleInfo);
  const { roomName, participantName, userToken } = battleInfo;
  const navigate = useNavigate();
  // openvidu 관련 설정정
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  // 방 게임 설정 관련
  const [isWaiting, setIsWaiting] = useState(true);

  // 새로고침 감지
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.alert("배틀방방을 나가시겠습니까?");
      navigate("/");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 방 입장 및 세션 참가 - 마운트 시 한 번만 실행하면 됨
  useEffect(() => {
    if (
      !battleInfo.roomName ||
      !battleInfo.participantName ||
      !battleInfo.userToken
    ) {
      console.error("Required information missing:", {
        roomName: battleInfo.roomName,
        participantName: battleInfo.participantName,
        userToken: battleInfo.userToken,
      });
      navigate("/");
      return;
    }

    async function initializeRoom() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Media permissions granted");
        await joinRoom();
      } catch (error) {
        console.error("Room initialization error:", error);
        navigate("/");
      }
    }

    console.log(
      "방에 조인하게됨:",
      battleInfo.roomName,
      battleInfo.participantName
    );
    initializeRoom();

    return () => {
      leaveRoom();
    };
  }, []); // 빈 의존성 배열이 맞습니다 - 마운트 시 한 번만 실행

  async function joinRoom() {
    console.log("Starting joinRoom with:", {
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
      const token = battleInfo.userToken;
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
    // navigate("/");
  }

  return (
    <div className="room-container">
      <button onClick={leaveRoom}>Leave Room</button>
      <div className="room-header">
        <h2>{battleInfo.roomName}</h2>
      </div>
      <div>
        {isWaiting ? (
          <BattleWaiting
            room={room}
            localTrack={localTrack}
            remoteTracks={remoteTracks}
          />
        ) : (
          <></>
        )}
      </div>

      <BattleChating />
    </div>
  );
}

export default BattleRoomPage;
