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
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

function BattleRoomPage() {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const clearBattleInfo = useBattleStore((state) => state.clearBattleInfo);
  const navigate = useNavigate();
  // openvidu 관련 설정
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  // 방 게임 설정 관련
  const [isWaiting, setIsWaiting] = useState(true);
  const [isMaster, setIsMaster] = useState(true);
  // 개발 환경인지 체크
  const isDevelopment = import.meta.env.MODE === "development";

  // 방 입장 및 세션 참가 - 마운트 시 한 번만 실행하면 됨
  useEffect(() => {
    if (!battleInfo.battleId) {
      console.log("Battle info is missing!");
      navigate("/");
      // 필요한 처리 (예: 홈으로 리다이렉트)
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
      cleanup(room);
    };
  }, []); // 빈 의존성 배열이 맞습니다 - 마운트 시 한 번만 실행

  async function joinRoom() {
    const room = new Room({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:overthecam.site:443", // livekit.yaml의 turn.udp_port 값 사용
          ],
        },
        {
          urls: [
            "turn:overthecam.site:3478", // UDP TURN
            "turns:overthecam.site:5349", // TLS TURN (turn.tls_port 값)
          ],
          username: "overthecam", // keys의 키 값
          credential: "dkssudgktpdydkssudgktpdydksdugtkdp", // keys의 값
        },
      ],
    });
    setRoom(room);

    // 다른 참가자의 상태 실시간 관리
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

      // 내 디바이스 찾아서 가져오기
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

  async function cleanup() {
    if (!room) return;

   try {
     if (room.localParticipant) {
       // 카메라와 마이크를 먼저 비활성화
       await room.localParticipant.setCameraEnabled(false);
       await room.localParticipant.setMicrophoneEnabled(false);
       // 모든 트랙 정리
       Array.from(room.localParticipant.trackPublications.values()).forEach(
         (publication) => {
           if (publication.track) {
             publication.track.stop(); // 이 메서드만 제공됨
           }
         }
       );
     }

     // room 연결 종료
     await room?.disconnect();

     // 상태 초기화
     setLocalTrack(null);
     setRemoteTracks([]);

     console.log("Cleanup completed successfully");
   } catch (error) {
     console.error("Error during cleanup:", error);
     try {
       await room?.disconnect();
     } catch (e) {
       console.error("Final disconnect attempt failed:", e);
     }
   }
  }

  async function handleLeavRoom() {
    await cleanup(room);
    navigate("/");
  }

  async function leaveRoom() {
    await room?.disconnect();
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
    clearBattleInfo();
    navigate("/");
  }

  return (
    <div className="room-container flex flex-col bg-white h-full p-5 rounded-xl m-4">
      <div className="room-header flex items-center w-full h-16 bg-cusGray p-3 rounded-xl justify-between">
        <button
          onClick={handleLeavRoom}
          className="btn justify-start bg-cusLightBlue-light !rounded-xl flex items-center h-12"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          나가기
        </button>
        <div className="room-header-name w-1/2 m-1 text-2xl font-semibold">
          <h2>{battleInfo.roomName}</h2>
        </div>
        <div className="flex">
          <div className="mx-1">
            <button className="random-subject btn bg-cusPink !rounded-xl flex items-center h-12">
              랜덤 주제 생성기
            </button>
          </div>
          <div className="mx-1">
            <button className="random-subject btn bg-cusYellow !rounded-xl flex items-center h-12">
              투표 만들기
            </button>
          </div>
        </div>
      </div>
      <div className="render-change flex">
        {isWaiting && isMaster ? (
          <>
            <div className="w-2/3">
              <BattleWaiting
                room={room}
                localTrack={localTrack}
                remoteTracks={remoteTracks}
                participantName={battleInfo.participantName}
              />
            </div>
            <div className="w-1/3">
              <BattleChating />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default BattleRoomPage;
