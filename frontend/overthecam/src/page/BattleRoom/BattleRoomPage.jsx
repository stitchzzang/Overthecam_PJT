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
  const [roomName, setRoomName] = useState(battleInfo.roomName);
  const navigate = useNavigate();
  // openvidu 관련 설정
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  // 방 게임 설정 관련
  const [isWaiting, setIsWaiting] = useState(true);

  // 개발 환경인지 체크
  const isDevelopment = import.meta.env.MODE === "development";

  // 방 입장 및 세션 참가 - 마운트 시 한 번만 실행하면 됨
  useEffect(() => {
    if (isDevelopment) {
      const devBattleInfo = {
        roomName: "개발용_방",
        participantName: "개발자",
        userToken: "dev_token",
      };

      // 상태 업데이트
      useBattleStore.getState().setBattleInfo(devBattleInfo);

      // localStorage에도 저장
      localStorage.setItem("devBattleInfo", JSON.stringify(devBattleInfo));
    }

    if (
      !battleInfo.roomName &&
      !battleInfo.participantName &&
      !battleInfo.userToken &&
      !isDevelopment
    ) {
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
    <div className="room-container flex flex-col bg-white h-full p-5 rounded-xl m-4">
      <div className="room-header flex items-center w-full h-16 bg-cusGray p-3 rounded-xl justify-between">
        <button
          onClick={leaveRoom}
          className="btn justify-start bg-cusLightBlue-light !rounded-xl flex items-center h-12"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          나가기
        </button>
        <div className="room-header-name w-1/2 m-1 text-2xl font-semibold">
          <h2>방 제목</h2>
        </div>
        <div className="flex">
          <div className="mx-1">
            <button className="random-subject btn bg-cusPink !rounded-xl flex items-center h-12">
              랜덤 주제 생성기
            </button>
          </div>
          <div className="mx-1">
            <div
              className="random-subject bg-cusGray-dark !rounded-xl flex items-center h-12 font-bold px-6 rounded-full border-transparent
  shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]
  transition-all duration-300 ease-in-out transform scale-100 "
            >
              현재 참여 인원
            </div>
          </div>
        </div>
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
