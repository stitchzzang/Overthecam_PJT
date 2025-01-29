import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import UserVideoComponent from "../../components/BattleRoom/UserVideo";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

function BattleRoomPage() {
  // useState를 사용하여 state 관리
  const [myOV, setOV] = useState(null);
  const location = useLocation();
  // create 를 통해 들어온 사람은 isMaster true값을 가짐
  const { sessionId, isMaster, token } = location.state;
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined); // Main video of the page
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [Master, setMaster] = useState(null); // 방장 정보
  const [isPlaying, setIsPlaying] = useState(false); // false 대기실 모드
  const [playersList, setPlayersList] = useState([]);
  const [isBattler, setIsBattler] = useState(false); // 배틀러 인지 아닌지
  const [speakingUsers, setSpeakingUsers] = useState(new Set()); // 말하는 사람 speak 효과과
  const [isLoading, setIsLoading] = useState(false); // 로딩 처리리

  const navigate = useNavigate();

  const OV = useRef(null); // useRef를 사용하여 변수에 대한 참조를 저장, 컴포넌트가 리렌더링되어도 변수에 대한 참조가 유지(값을 유지)

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        session.disconnect();
        console.log("🔴 beforeunload 실행: OpenVidu 세션 종료");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]); // session이 바뀔 때마다 beforeunload 설정

  // isInMeeting 상태가 변경될 때만 OpenVidu 세션을 관리
  useEffect(() => {
    if (isPlaying && isBattler) {
      // 게임모드드로 전환 시, OpenVidu 세션 생성
      const newSession = createBattlerSesion();
      // 세션 생성 함수
      setSession(newSession);
      console.log("🟢 회의 모드 ON: OpenVidu 세션 연결됨");
    } else {
      // 대기실로 돌아오면 세션 해제
      if (session) {
        session.disconnect();
        setSession(null);
        console.log("🛑 대기실 모드 ON: OpenVidu 세션 종료됨");
      }
    }
  }, [isPlaying, isBattler]); // isPlaying 값이 바뀔 때 실행

  const createBattlerSesion = () => {
    const OV = new OpenVidu();
    const newSession = OV.initSession();

    const publisher = OV.initPublisher(undefined, {
      videoSource: undefined, // 비디오 소스 설정 (undefined로 기본값 사용)
      audioSource: undefined, // 오디오 소스 설정 (기본값 사용용)
      publishAudio: true, // 오디오 활성화
      publishVideo: true, // 초기에는 비디오 비활성화 (대기실 모드)
      resolution: "640x480", // 해상도 설정 (필요에 맞게 조정)
      frameRate: 30, // 초당 프레임 수 (필요에 맞게 조정)
    });

    newSession.on("streamCreated", (event) => {
      console.log("배틀러 모드로 스트림 시작");
    });

    newSession.on("streamDestroyed", (event) => {
      console.log("배틀러 모드 스트림 파괴...");
    });

    return { newSession, publisher };
  };

  // 버튼으로 대기실 ↔ 회의실 모드 전환
  const toggleMeeting = () => setIsInMeeting((prev) => !prev);

  // 렌더링 시 오픈비두 띄우기 - 방장이 접속 하면, 오픈 비두 세션이 만들어 진다.
  useEffect(() => {
    const newOV = new OpenVidu();
    // setOV(newOV);
    const newSession = newOV.initSession();

    newSession.on("streamCreated", (event) => {
      const subscriber = newSession.subscribe(event.stream, undefined);
      setSubscribers((subscribers) => {
        console.log("새로운 참여자: ", subscribers);
        return [...subscribers, subscriber];
      });
    });

    newSession.on("streamDestroyed", (event) => {
      setSubscribers((subscribers) =>
        subscribers.filter((sub) => sub !== event.stream.streamManager)
      );
    });

    newSession.on("exception", (exception) => {
      console.warn("세션 예외 발생:", exception);
    });

    newSession.on("connectionDestroyed", (event) => {
      // 커넥션 끊기면 서버에서 자동으로 사용자 종료하는 설정
      console.log("사용자 연결 종료: ", event.connection);
    });

    // 비동기적으로 connect()를 완료한 후에만 publish()를 호출
    const connectAndPublish = async () => {
      try {
        await newSession.connect(token); // 토큰으로 세션에 연결
        console.log("세션 연결 성공");

        // 퍼블리셔 초기화 후, 세션에 퍼블리셔를 퍼블리시
        const publisher = newOV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: false,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        // 퍼블리셔 퍼블리시
        await newSession.publish(publisher);
        setPublisher(publisher);
      } catch (error) {
        console.log("There was an error connecting to the session:", error);
      }
    };

    // 비동기 요청 함수 호출
    connectAndPublish();

    setSession(newSession);

    return () => {
      if (newSession && newSession.connection) {
        newSession.disconnect();
        setCurrentVideoDevice(null);
        setPublisher(null);
        setSession(null);
      } else {
        console.log(
          "세션이 연결되지 않았습니다. disconnect 호출을 생략합니다."
        );
      }
    };
  }, [sessionId, token]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      subscribers.forEach((subscriber) => {
        if (subscriber) {
          try {
            subscriber.stream?.dispose();
          } catch (error) {
            console.warn("Error disposing subscriber:", error);
          }
        }
      });
    };
  }, [subscribers]);

  // 세션 나가기 함수 수정
  const leaveSession = useCallback(async () => {
    try {
      // Publisher MediaStream 정리
      if (publisher) {
        try {
          const stream = publisher.stream.getMediaStream();
          if (stream) {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
          }
          await publisher.stream?.dispose();
          setPublisher(undefined);
        } catch (e) {
          console.warn("Publisher cleanup error:", e);
        }
      }

      // Subscribers MediaStream 정리
      for (const subscriber of subscribers) {
        try {
          const stream = subscriber.streamManager?.stream?.getMediaStream();
          if (stream) {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
          }
          await subscriber.streamManager?.stream?.dispose();
        } catch (e) {
          console.warn("Subscriber cleanup error:", e);
        }
      }
      setSubscribers([]);

      // MainStreamManager 정리
      setMainStreamManager(undefined);

      // 세션 정리
      if (session) {
        try {
          // silent 옵션 추가
          await session.disconnect({ silent: true });
          navigate("/battle-list");
        } catch (e) {
          console.warn("Session disconnect error:", e);
        }
      }
      setSession(undefined);

      // OpenVidu 객체 정리
      if (OV.current) {
        OV.current = null;
      }
    } catch (error) {
      console.warn("Leave session error:", error);
    } finally {
      // 최종 상태 초기화
      setSession(undefined);
      setSubscribers([]);
      setPublisher(undefined);
      setMainStreamManager(undefined);
    }
  }, [session, publisher, subscribers]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (session) {
        session.disconnect();

        if (publisher) {
          publisher.stream.dispose();
        }
        setSession(null);
      }
    };
  }, [session]);

  return (
    <div className="container">
      <h1>대기실</h1>
      <div id="session">
        <div id="session-header">
          <h1 id="session-title">{sessionId}</h1>
          <input
            className="btn btn-large btn-danger"
            type="button"
            id="buttonLeaveSession"
            onClick={leaveSession}
            value="Leave session"
          />
        </div>

        <div id="video-container" className="col-12">
          {/* Talker 섹션 */}
          <div className="row mb-3">
            {/* 내가 Talker인 경우 표시 */}
            {publisher && (
              <div className="col-md-6">
                <div className="participant-name">
                  <span>(발표자)</span>
                </div>
                <UserVideoComponent streamManager={publisher} />
              </div>
            )}
            {subscribers.map((subscriber, i) => {
              return (
                <div key={i}>
                  <div className="participant-name">
                    <span>(다른 사람람)</span>
                  </div>
                  <UserVideoComponent streamManager={subscriber} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleRoomPage;
