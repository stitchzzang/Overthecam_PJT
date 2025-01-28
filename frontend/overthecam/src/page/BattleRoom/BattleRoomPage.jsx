import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import UserVideoComponent from "../../components/BattleRoom/UserVideo";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

function BattleRoomPage() {
  // useState를 사용하여 state 관리
  const [myOV, setOV] = useState(null);
  const location = useLocation();
  const { sessionId, isMaster, token } = location.state;
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playersList, setPlayersList] = useState([]);
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined); // Main video of the page
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const OV = useRef(null); // useRef를 사용하여 변수에 대한 참조를 저장, 컴포넌트가 리렌더링되어도 변수에 대한 참조가 유지(값을 유지지)

  // useEffect 훅을 사용해서 컴포넌트 렌더링 시 특정 작업 실행하는 hook
  useEffect(() => {
    // handleBeforeUnload 함수 생성
    const handleBeforeUnload = () => leaveSession();
    // 언마운트(페이지 이동 시, beforeunload) 시 세션 연결 해제(handleBeforeUnload 함수 실행)
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // 언마운트 시 handleBeforeUnload 함수 실행하고 나서, 이전에 추가했던 이벤트 제거(메모리 누수 방지)
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // 빈 배열을 넣어주면 컴포넌트가 마운트될 때만 실행되고 언마운트될 때만 실행
  }, []);

  // 렌더링 시 오픈비두 띄우기 - 방장이 접속 하면, 오픈 비두 세션이 만들어 진다.
  useEffect(() => {
    const newOV = new OpenVidu();
    setOV(newOV);
    const newSession = newOV.initSession();

    newSession.on("streamCreated", (event) => {
      const subscriber = newSession.subscribe(event.stream, undefined);
      // 구독자의 connectionData에서 닉네임 파싱
      console.log(event.stream.connection.data);
      const connectionData = event.stream.connection.data;
      const nickname = connectionData || "Anonymous";
      setSubscribers((prevSubscribers) => [
        ...prevSubscribers,
        { streamManager: subscriber, nickname: nickname }, // 구독자 객체에 닉네임 추가
      ]);

      console.log("새로운 참여자: ", nickname);
    });

    newSession.on("streamDestroyed", (event) => {
      setSubscribers((prevSubscribers) =>
        prevSubscribers.filter(
          (sub) => sub.streamManager.stream.streamId !== event.stream.streamId
        )
      );
    });

    newSession
      .connect(token)
      .then(() => {
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
        newSession.publish(publisher);
        setPublisher(publisher);

        const nickname = "나";
        setSubscribers((prevSubscribers) => [
          ...prevSubscribers,
          { streamManager: publisher, nickname: nickname },
        ]);
      })
      .catch((error) =>
        console.log("There was an error connecting to the session:", error)
      );

    setSession(newSession);

    // // 새로운 방장 정보를 처리하는 이벤트 리스너 추가
    // newSession.on("signal:newModerator", (event) => {
    //   const newModeratorNickname = event.data;
    //   // 현재 사용자가 새로운 방장인지 확인하고 상태 업데이트
    //   if (userNickname === newModeratorNickname) {
    //     setIsModerator(true);
    //     console.log("방장이 되었습니다.");
    //   }
    // });

    return () => {
      if (newSession) {
        newSession.disconnect();

        setCurrentVideoDevice(null);
        setPublisher(null);
        setSession(null);
        // setSubscribers([]);
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
            stream.getTracks().forEach(track => {
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
            stream.getTracks().forEach(track => {
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
                <div
                  className={`talker-video-container ${
                    speakingUsers.has(publisher.stream.connection.connectionId)
                      ? "speaking"
                      : ""
                  }`}
                >
                  <div className="participant-name">
                    <span>(발표자)</span>
                    {speakingUsers.has(
                      publisher.stream.connection.connectionId
                    ) && <span className="speaking-indicator">🎤</span>}
                  </div>
                  <UserVideoComponent streamManager={publisher} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleRoomPage;
