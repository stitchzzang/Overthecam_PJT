import { Room, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBattleStore } from "../../store/Battle/BattleStore";

import { useWebSocketContext } from "../../hooks/useWebSocket";
import BattleHeader from "../../components/BattleRoom/BattleHeader";
import BattleWaiting from "../../components/BattleRoom/BattleWaiting/BattleWaiting";
import BattleStart from "../../components/BattleRoom/BattleStart/BattleStart";
import BattlerSettingModal from "../../components/BattleRoom/BattleWaiting/BattleWaitingModal/BattlerSettingModal";
import BattleLeaveConfirmModal from "../../components/BattleRoom/common/BattleLeaveComfirmModal";
import BattleResultModal from "../../components/BattleRoom/BattleStart/BattleStartModal/BattleResultModal";
import NoticeAlertModal from "../../components/@common/NoticeAlertModal";
import FailAlertModal from "../../components/@common/FailAlertModal";
import BattleEndModal from "../../components/BattleRoom/BattleStart/BattleStartModal/BattleEndModal";
import useUserStore from "../../store/User/UserStore";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

function BattleRoomPage() {
  const battleInfo = useBattleStore((state) => state.battleInfo);
  const clearBattleInfo = useBattleStore((state) => state.clearBattleInfo);

  const navigate = useNavigate();
  // user 데이터
  const userId = useUserStore((s) => s.userId);
  // 웹소켓 관련
  const {
    status,
    error,
    connectWS,
    disconnectWS,
    vote,
    startBattle,
    readyForBattle,
    isStarted,
    isBattleEnded,
  } = useWebSocketContext();
  // openvidu 관련 설정
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [mediaStream, setMediaStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [host, setHost] = useState(""); // 방장 이름 담는 로직

  // 방 게임 설정 관련
  // const [isWaiting, setIsWaiting] = useState(true);
  const [isMaster, setIsMaster] = useState(battleInfo.isMaster);

  // 모달 처리
  const battlerSettingModal = useRef(); // 배틀러 선정 모달 -> 대기실로 옮겨도 될듯
  const leaveConfirmModal = useRef(); // 나가기 확인 버튼
  const endBattleModal = useRef(); // 배틀 종료 버튼
  const resultModal = useRef(); // 결과 알림모달

  // 예외처리 관련
  const failTost = useRef(); // 토스트
  const noticeToast = useRef(); // 알림 토스트
  const isCleanedUp = useRef(); // 클린업 함수 수행 여부 판단

  // 로딩
  const [isResultLoading, setIsResultLoading] = useState(false);

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

  // participants가 업데이트될 때마다 실행됨
  useEffect(() => {
    console.log("업데이트된 참가자 목록:", participants);
  }, [participants]);

  // 방 입장 및 세션 참가 - 마운트 시 한 번만 실행하면 됨
  useEffect(() => {
    let isSubscribed = true; // cleanup을 위한 flag

    const initializeWebSocket = async () => {
      if (!battleInfo.battleId) {
        failTost.current?.showAlert("배틀 정보가 없습니다.");
        setTimeout(() => navigate("/main/battle-list"), 1500);
        return;
      }

      try {
        // WebSocket 연결이 이미 되어있는지 확인
        if (
          wsStatus === WS_STATUS.CONNECTING ||
          wsStatus === WS_STATUS.CONNECTED
        ) {
          console.log("WebSocket is already connected or connecting");
          return;
        }

        if (isSubscribed) {
          // 컴포넌트가 여전히 마운트된 상태인지 확인
          await connectWS(BASE_URL, token);
        }
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    };

    // 이벤트 리스너 등록
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleRefreshAttempt);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("unload", () => {
      if (room && isConnected) {
        cleanup(room);
      }
    });

    // 초기화 실행
    initializeRoom();
    initializeWebSocket();

    // cleanup
    return () => {
      isSubscribed = false; // cleanup flag 설정
      window.removeEventListener("beforeunload", handleRefreshAttempt);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      if (room) {
        disconnectWS();
        cleanup(room);
      }
    };
  }, []); // 빈 dependency 배열 유지

  // 예외 처리
  useEffect(() => {
    if (!room) return;

    // 네트워크 상태 변경 핸들러
    const handleConnectionStateChange = (state) => {
      console.log("Connection state changed:", state);
      if (state === "disconnected" || state === "failed") {
        failTost.current?.showAlert("연결이 끊어졌습니다. 다시 접속해주세요.");
        setTimeout(() => navigate("/main/battle-list"), 1500);
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
          failTost.current?.showAlert("연결이 끊어졌습니다.");
          cleanup();
          disconnectWS();
          setTimeout(() => navigate("/main/battle-list"), 1500);
          break;
        default:
          failTost.current?.showAlert("오류가 발생했습니다.");
          cleanup();
          disconnectWS();
          setTimeout(() => navigate("/main/battle-list"), 1500);
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

  // ws 연결 에러
  useEffect(() => {
    if (status === "DISCONNECTED") {
      // 잠시 후 재연결 시도
      const reconnectTimer = setTimeout(() => {
        connectWS(BASE_URL, token);
      }, 3000);

      return () => clearTimeout(reconnectTimer);
    } else if (status === "ERROR") {
      failTost.current?.showAlert(error);
    }
  }, [status, connectWS, error]);

  async function initializeRoom() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { max: 24 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });
      setMediaStream(stream);
      console.log("Media permissions granted");
      await joinRoom();
    } catch (error) {
      console.error("Room initialization error:", error);
      if (error.name === "NotAllowedError") {
        failTost.current?.showAlert("카메라/마이크 권한이 필요합니다.");
      } else if (error.name === "NotFoundError") {
        failTost.current?.showAlert("카메라/마이크를 찾을 수 없습니다.");
      } else {
        failTost.current?.showAlert("연결 중 오류가 발생했습니다.");
      }
      setTimeout(() => navigate("/main/battle-list"), 1500);
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
        participant.identity,
        participant.metadata
      );
      setRemoteTracks((prev) => [
        ...prev,
        {
          trackPublication: publication,
          participantIdentity: participant.identity,
          participantMetadata: participant.metadata,
        },
      ]);
    });

    // 방 연결 시 사용
    room.on(RoomEvent.Connected, async () => {
      try {
        // localParticipant가 설정될 때까지 기다림
        while (!room.localParticipant?.metadata) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const allParticipants = [];
        if (room.localParticipant?.metadata) {
          const localMeta = JSON.parse(room.localParticipant.metadata);
          allParticipants.push(localMeta);
        }
        if (room.remoteParticipants) {
          room.remoteParticipants.forEach((participant, key) => {
            const remoteMeta = JSON.parse(participant.metadata);
            allParticipants.push(remoteMeta);
            if (JSON.parse(participant.metadata).role === "host") {
              setHost(JSON.parse(participant.metadata).nickname);
            }
          });
        }
        setParticipants(allParticipants);
      } catch (error) {
        console.error("Room connection error:", error);
        failTost.current?.showAlert("연결 중 오류가 발생했습니다.");
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks((prev) =>
        prev.filter(
          (track) => track.trackPublication.trackSid !== publication.trackSid
        )
      );
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("participant connected:", participant.metadata);
      setParticipants((prev) => [...prev, JSON.parse(participant.metadata)]);
      console.log(participants);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("Participant disconnected:", participant.identity);
      setRemoteTracks((prev) =>
        prev.filter(
          (track) => track.participantIdentity !== participant.identity
        )
      );
      setParticipants((prev) => {
        const filteredParticipants = prev.filter(
          (p) => p.nickname !== participant.identity
        );
        return filteredParticipants;
      });
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

      const audioTrack = room.localParticipant.audioTrackPublications
        .values()
        .next().value?.audioTrack;

      if (audioTrack) {
        console.log("Audio track obtained:", audioTrack);
        setLocalAudioTrack(audioTrack);
      } else {
        console.warn("No audio track available");
      }
    } catch (error) {
      console.error("Room connection error:", error);
      failTost.current?.showAlert("방 연결에 실패했습니다.");
      cleanup();
      setTimeout(() => navigate("/main/battle-list"), 1500);
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
      disconnectWS();
      setRoom(undefined);
      setLocalTrack(undefined);
      setRemoteTracks([]);
      clearBattleInfo();

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
    leaveConfirmModal.current?.showModal();
  }

  // 모달 확인 하면 클린업 함수 사용
  const handleConfirmLeave = async () => {
    await cleanup(room);
  };

  const battlerModalShow = (e) => {
    battlerSettingModal.current?.showModal(vote.option1, vote.option2);
  };

  const endBattleModalShow = (e) => {
    endBattleModal.current?.showModal();
  };

  const handleBattleStart = (e) => {
    // setIsWaiting(false);
    readyForBattle(userId, battleInfo.participantName, true);
    startBattle();
  };

  useEffect(() => {
    if (isStarted) {
      // isStarted가 true일 때만 실행
      noticeToast.current?.showAlert("배틀이 시작 되었습니다.");
    }
  }, [isStarted]);

  useEffect(() => {
    if (isBattleEnded) {
      setIsResultLoading(true); // 로딩 시작
      noticeToast.current?.showAlert("배틀이 종료 되었습니다.");
      // 3초 조금 더 여유 있게 후에 결과 모달 표시
      setTimeout(() => {
        setIsResultLoading(false); // 로딩 끝
        resultModal.current?.showAlert();
      }, 2000);
    }
  }, [isBattleEnded]);

  // 연결 상태에 따른 에러 처리
  if (status === "ERROR") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">
          <p>연결이 끊어졌습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cusRed text-white rounded hover:bg-red-600"
          >
            다시 연결
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-container flex flex-col bg-white p-5 h-full rounded-xl m-4">
      <BattleHeader
        isWaiting={!isStarted}
        isMaster={isMaster}
        onshowLeaveConfirmModal={handleLeavRoom}
        onShowEndBattleModal={endBattleModalShow}
      />

      <div className="render-change flex-1 h-0 relative">
        {isResultLoading ? (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cusRed"></div>
              <h3 className="text-xl font-bold">결과 집계 중</h3>
              <p className="text-gray-600">잠시만 기다려주세요...</p>
            </div>
          </div>
        ) : null}

        {!isStarted ? (
          <div className="flex h-full">
            {/* h-full 유지 */}
            <div className="w-full h-full flex flex-col">
              {/* flex flex-col 추가 */}
              <BattleWaiting
                room={room}
                localTrack={localTrack}
                localAudioTrack={localAudioTrack}
                remoteTracks={remoteTracks}
                participantName={battleInfo.participantName}
                isMaster={isMaster}
                host={host}
                participants={participants}
                onShowBattlerModal={battlerModalShow}
                onBattleStart={handleBattleStart}
              />
            </div>
          </div>
        ) : (
          <>
            <BattleStart
              localTrack={localTrack}
              remoteTracks={remoteTracks}
              participantName={battleInfo.participantName}
            />
          </>
        )}
      </div>
      <BattlerSettingModal
        ref={battlerSettingModal}
        participants={participants}
        myNickname={battleInfo.participantName}
      />
      <FailAlertModal ref={failTost} />
      <NoticeAlertModal ref={noticeToast} />
      <BattleLeaveConfirmModal
        ref={leaveConfirmModal}
        onConfirm={handleConfirmLeave}
      />
      <BattleEndModal ref={endBattleModal} />
      <BattleResultModal ref={resultModal} onFinish={handleConfirmLeave} />
    </div>
  );
}

export default BattleRoomPage;
