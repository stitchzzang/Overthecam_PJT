import { Room, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "../../store/Battle/BattleStore";
import BattleChating from "../../components/BattleRoom/common/BattleChating";
import BattleWaiting from "../../components/BattleRoom/BattleWaiting/BattleWaiting";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import FailAlertModal from "../../components/@common/FailAlertModal";
import BattlerSettingModal from "../../components/BattleRoom/BattleWaiting/BattleWaitingModal/BattlerSettingModal";
import BattleLeaveConfirmModal from "../../components/BattleRoom/common/BattleLeaveComfirmModal";
import { leaveRoom } from "../../service/BattleRoom/api";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

function BattleRoomPage() {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const clearBattleInfo = useBattleStore((state) => state.clearBattleInfo);

  const navigate = useNavigate();
  // openvidu 관련 설정
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [mediaStream, setMediaStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 방 게임 설정 관련
  const [isWaiting, setIsWaiting] = useState(true);
  const [isMaster, setIsMaster] = useState(battleInfo.isMaster);

  // 모달 처리
  const battlerSettingModal = useRef(); // 배틀러 선정 모달 -> 대기실로 옮겨도 될듯
  const leaveConfirmModal = useRef(); // 나가기 확인 버튼

  // 예외처리 관련련
  const failTost = useRef(); // 토스트
  const isCleanedUp = useRef(); // 클린업 함수 수행 여부 판단

  // 예외처리

  // 새로고침 버튼누르면 브라우저 보안 정책에 의해서 기본 alret 뜸
  const handleRefreshAttempt = (e) => {
    e.preventDefault();
    e.returnValue = "정말 나가시겠습니까?"; // Chrome requires returnValue to be set
    window.history.pushState(null, "", window.location.pathname);
  };

  // 키보드로 수행하는 새로 고침 시 나가기 모달
  const handleKeyDown = (e) => {
    if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
      e.preventDefault();
      handleRefreshAttempt(e);
    }
  };

  // 브라우저 뒤로가기 이벤트 핸들러
  const handlePopState = (e) => {
    e.preventDefault();
    leaveConfirmModal.current?.showModal();
    // 현재 페이지에 머무르기 위해 history 상태 추가
    window.history.pushState(null, "", window.location.pathname);
  };

  // 모달 확인 하면 클린업 함수 사용
  const handleConfirmLeave = async () => {
    await cleanup(room);
  };

  // 방 입장 및 세션 참가 - 마운트 시 한 번만 실행하면 됨
  useEffect(() => {
    if (!battleInfo.battleId) {
      failTost.current?.showAlert("배틀 정보가 없습니다.");
      setTimeout(() => navigate("/battle-list"), 1500); // 토스트 메시지를 보여줄 시간을 줌
      return;
    }

    window.history.pushState(null, "", window.location.pathname);

    // 이벤트 리스너 등록
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleRefreshAttempt);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("unload", () => {
      if (room && isConnected) {
        cleanup(room);
      }
    });

    initializeRoom();

    // cleanup 언마운트시 해제
    return () => {
      window.removeEventListener("beforeunload", handleRefreshAttempt);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      if (room) {
        cleanup(room)
      }
    };
  }, []); 

  // 예외 처리
  useEffect(() => {
    if (!room) return;

    // 네트워크 상태 변경 핸들러
    const handleConnectionStateChange = (state) => {
      console.log("Connection state changed:", state);
      if (state === "disconnected" || state === "failed") {
        failTost.current?.showAlert("연결이 끊어졌습니다. 다시 접속해주세요.");
        setTimeout(() => navigate("/battle-list"), 1500);
      }
    };

    // 예외 처리
    const handleError = async (error) => {
      console.error("Room error:", error);
      switch (error.code) {
        case "permission_denied":
          failTost.current?.showAlert("카메라 마이크 권한을 확인 해주세요");
          break;
        case "disconnected":
          failTost.current?.showAlert(
            "연결이 끊어졌습니다."
          );
          setTimeout(() => navigate("/battle-list"), 1500);
          break;
        default:
          failTost.current?.showAlert(
            "오류가 발생했습니다."
          );
          setTimeout(() => navigate("/battle-list"), 1500);
      }
    };

    // 이벤트 리스너 등록
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
    room.on(RoomEvent.Disconnected, handleError);
    room.on("error", handleError);

    // cleanup: 컴포넌트 언마운트나 room 변경 시
    return () => {
       if (!isCleanedUp.current) {
         cleanup(); // 아직 cleanup이 실행되지 않았다면 실행
       }
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
      room.off(RoomEvent.Disconnected, handleError);
      room.off("error", handleError);
    };
  }, [room]);

  async function initializeRoom() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      console.log("Media permissions granted");
      await joinRoom();
    } catch (error) {
      console.error("Room initialization error:", error);
      // 토스트 메시지를 보여준 후 navigate
      if (error.name === "NotAllowedError") {
        failTost.current?.showAlert("카메라/마이크 권한이 필요합니다.");
      } else if (error.name === "NotFoundError") {
        failTost.current?.showAlert("카메라/마이크를 찾을 수 없습니다.");
      } else {
        failTost.current?.showAlert("연결 중 오류가 발생했습니다.");
      }
      setTimeout(() => navigate("/battle-list"), 1500);
    }
  }

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
      failTost.current?.showAlert("방 연결에 실패했습니다.");
      setTimeout(() => navigate("/battle-list"), 1500);
    }

    setIsConnected(true);
  }

  async function cleanup() {
    if (isCleanedUp.current || !room) return;

    try {
      isCleanedUp.current = true;
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

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        setMediaStream(null);
      }

      // 상태 초기화
      setLocalTrack(null);
      setRemoteTracks([]);
      
      // room 연결 종료
      await room?.disconnect();
      setRoom(undefined);
      setLocalTrack(undefined);
      setRemoteTracks([]);
      clearBattleInfo();

      try {
        console.log(battleInfo.battleId);
        const response = await leaveRoom(battleInfo.battleId);
        console.log("방 나가기 처리가 되었음:", response.data.message);
      } catch (error) {
        console.error("배틀방 나가기 에러:", error);
      }

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

  // handleLeavRoom 함수 수정
  async function handleLeavRoom() {
    leaveConfirmModal.current?.showModal();
  }

  const battlerModalShow = (e) => {
    battlerSettingModal.current?.showModal();
  };

  const handleBattleStart = (e) => {
    setIsWaiting(false);
  };

  return (
    <div className="room-container flex flex-col bg-white p-5 h-full rounded-xl m-4">
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
        {isWaiting ? (
          <div className="flex">
            <div className="mx-1">
              <button className="random-subject btn bg-cusPink !rounded-xl flex items-center h-12">
                랜덤 주제 생성기
              </button>
            </div>
            {/* 방장만 배틀러 선정 버튼이 보임 */}
            {isMaster && (
              <div className="mx-1">
                <button
                  onClick={battlerModalShow}
                  className="battler-selector btn bg-cusYellow !rounded-xl flex items-center h-12"
                >
                  배틀러 선정하기
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="my-points flex bg-cusPink rounded-xl flex items-center h-12 clay">
            <div className="points">
              <p>포인트 : </p>
            </div>
            <div className="cheer-score">
              <p>응원 점수: </p>
            </div>
          </div>
        )}
      </div>
      <div className="render-change flex-1 h-0">
        {isWaiting ? (
          <div className="flex h-full">
            {/* h-full 유지 */}
            <div className="w-3/4 h-full flex flex-col">
              {/* flex flex-col 추가 */}
              <BattleWaiting
                room={room}
                localTrack={localTrack}
                remoteTracks={remoteTracks}
                participantName={battleInfo.participantName}
                isMaster={battleInfo.isMaster}
                onBattleStart={handleBattleStart}
              />
            </div>
            <div className="w-1/4 flex flex-col h-full mb-5">
              <BattleChating />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <BattlerSettingModal ref={battlerSettingModal} />
      <FailAlertModal ref={failTost} />
      <BattleLeaveConfirmModal
        ref={leaveConfirmModal}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}

export default BattleRoomPage;
