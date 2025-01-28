import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";
import axios from "axios";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

function BattleRoomPage() {
  const [battleId, setbattleId] = useState("1234");
  const [session, setSession] = useState(undefined);
  const [sessionId, setSessionId] = useState(battleId); // 세션 id (배틀방 id)
  const [roomName, setRoomName] = useState(""); // 방 이름
  const [roomMaster, setRoomMaster] = useState(""); // 방장
  const [myNickName, setMyNickName] = useState(""); // 입장한 사람 닉네임
  const [publisher, setPublisher] = useState(undefined); // publisher (나)
  const [subscribers, setSubscribers] = useState([]); // 나말고 다른 사람
  const [joinerMode, setJoinerMode] = useState(true); // 방장 인지 아닌지...
  const [myStreamManager, setMyStreamManager] = useState(undefined); // 내(사용자) 비디오 스트림 제어용
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null); // 현재 사용중인 비디오(카메라)
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        leaveSession();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [session]);

  // 방 id를 가지고 정보를 받아 온다
  useEffect(() => {
    if (isConnecting) return;

    // axios 요청
    setRoomName("방 이름");
    setRoomMaster("방장 이름");
    setMyNickName("들어온 사람 닉네임");

    const initializeSession = async () => {
      try {
        setIsConnecting(true);
        if (!session) {
          await joinSession();
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeSession();

    return () => {
      if (session) {
        leaveSession();
      }
    };
  }, []);

  const joinSession = useCallback(
    async (event) => {
      if (session) {
        console.log("이미 세션이 있습니다다")
        return;
      }

      if (event) {
        event.preventDefault();
      }

      const mode = event?.target?.value === "master" ? "master" : "member";

      const newOV = new OpenVidu();
      const newSession = newOV.initSession();

      newSession.on("streamCreated", async (event) => {
        try {
          const subscriber = await newSession.subscribe(
            event.stream,
            undefined
          );
          setSubscribers((subscribers) => [...subscribers, subscriber]);
          console.log(
            "New subscriber added:",
            subscriber.stream.connection.connectionId
          );
        } catch (error) {
          console.error("Error subscribing to stream:", error);
        }
      });

      newSession.on("streamDestroyed", (event) => {
        setSubscribers((subscribers) =>
          subscribers.filter(
            (subscriber) => subscriber.stream.streamId !== event.stream.streamId
          )
        );
        console.log(
          "Subscriber removed:",
          event.stream.connection.connectionId
        );
      });

      newSession.on("exception", (exception) => {
        console.warn("세션 예외 발생", exception);
      });

      newSession.on("connectionCreated", (event) => {
        console.log("Connection created: ", event.connection.connectionId);
      });

      newSession.on("connectionDestroyed", (event) => {
        console.log("Connection destroyed: ", event.connection.connectionId);
        if (participants[connectionId]) {
          // 참여자를 state에서 삭제
          setParticipants((prev) => {
            const updated = { ...prev };
            delete updated[connectionId];
            return updated;
          });
        } else {
          console.warn(`Unknown connection: ${connectionId}`);
        }
      });

      newSession.on("sessionDisconnected", () => {
        setSubscribers([]);
        setSession(null);
      });

      setSession(newSession);

      // 세션에 연결하는 로직 추가
      // 예: 토큰을 받아와서 세션에 연결
      const token = await getToken();
      newSession
        .connect(token, { clientData: myNickName })
        .then(() => {
          const newPublisher = newOV.initPublisher(undefined, {
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: "640x480", // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });

          newSession.publish(newPublisher);

          setPublisher(newPublisher);
          setMyStreamManager(newPublisher);
        })
        .catch((error) => {
          console.error("There was an error connecting to the session:", error);
        });
    },
    [session, myNickName]
  );

  const leaveSession = () => {
    if (session) {
      console.log("Leaving session");
      session.disconnect();
      setSession(undefined);
      console.log("Session disconnected");
    }

    setSession(undefined);
    setSubscribers([]);
    setPublisher(undefined);
    setMyStreamManager(undefined);
  };

  const getToken = async () => {
    const response = await axios.post(APPLICATION_SERVER_URL + "api/sessions", {
      customSessionId: sessionId,
    });
    const sessionIdFromResponse = response.data; // The sessionId
    const tokenResponse = await axios.post(
      APPLICATION_SERVER_URL +
        "api/sessions/" +
        sessionIdFromResponse +
        "/connections",
      {}
    );
    return tokenResponse.data; // The token
  };

  return (
    <div>
      <p>방번호: {battleId}</p>
      <h1>대기실: {roomName}</h1>
      <p>방장: {roomMaster}</p>
    </div>
  );
}

export default BattleRoomPage;
