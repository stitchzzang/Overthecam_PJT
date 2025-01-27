import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";

const APPLICATION_SERVER_URL = "";

function BattleWaitingPage() {
  const { battleId } = useParams();
  const [OV, setOV] = useState(undefined);
  const [session, setSession] = useState(undefined); // openvidu 세션
  const [sessionId, setSessionId] = useState(battleId); // 세션 id (배틀방 id)
  const [roomName, setRoomName] = useState(""); // 방 이름
  const [roomMaster, setRoomMaster] = useState(""); // 방장
  const [myNickName, setMyNickName] = useState(""); // 입장한 사람 닉네임
  const [publisher, setPublisher] = useState(undefined); // publisher (나)
  const [subscribers, setSubscribers] = useState([]); // 나말고 다른 사람
  const [joinerMode, setJoinerMode] = useState(true); // 방장 인지 아닌지...
  const [myStreamManager, setMyStreamManager] = useState(undefined); // 내(사용자자) 비디오 스트림 제어용
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null); // 현재 사용중인 비디오(카메라라)

  useEffect(()=>{
    window.addEventListener('beforeunload', leaveSession);

    return () => {
      window.removeEventListener('beforeunload', leaveSession);
    };
  }, [])

  // 방 id를 가지고 정보를 받아 온다
  useEffect(() => {
    // axios 요청
    setRoomName("방 이름");
    setRoomMaster("방장 이름");
    setMyNickName("들어온 사람 닉네임");
  }, []);

  const joinSession = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
      }

      // create 에서 바로 넘어온 경우 joinSession이 자동으로 이루어 진다 -> 방장
      // 다른 곳에서 join 한 경우 방장 말고 멤버
      // 방장과 그냥 참여한 사람 구분 로직 다시 작성할 것
      const mode = event.target.value === "master" ? "master" : "member";

      const newOV = new OpenVidu();
      const newSession = newOV.current.initSession();

      newSession.on("streamCreated", (event) => {
        const subscriber = newSession.subscriber(event.stream, undefined);
        setSubscribers((subscribers) => [...subscribers, subscriber]);
      });

      newSession.on("streamDestroyed", (event) => {
        setSubscribers((subscribers) => {
          subscribers.filter((sub) => sub !== event.stream.streamManager);
        });
      });

      newSession.on("exception", (exeption) => {
        console.warn("세션 예외 발생", exeption);
      });

      // 대기실 종료, 뒤로 가기 등 이벤트 시 세션 disconnect를 위해서 useState에 저장
      setOV(newOV);
      setSession(newSession);

      try {
        const token = await getToken();
        const userMode =
          mode === "master" ? `${myUserName}-master` : `${myUserName}-master`;

        await session.connect(token, { clientData: userMode }); // 방장인지 아닌지 전달

        const publisher = await OV.current.initPublisherAsync(undefined, {
          audioSource: undefined, // 기본 마이크 사용
          videoSource: undefined, // 기본 비디오(카메라) 사용
          publishAudio: false, // 마이크 끄고 입장됨
          publishVideo: true, // 비디오 켜고 입장됨
          resolution: "1920x1080",
          frameRate: 30,
          // insertMode: "APPEND", DOM 컨테이너 마지막 자식요소로 video 태그가 추가됨
          mirror: false,
        });

        publisher.on("streamCreated", (event) => {
          console.log("Publisher stream created:", event);
        });

        publisher.on("streamPlaying", () => {
          console.log("Publisher stream playing");
        });

        await session.publish(publisher);

        const devices = await OV.current.getDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        const currentVideoDeviceId = publisher.stream
          .getMediaStream()
          .getVideoTracks()[0]
          .getSettings().deviceId;

        const currentVideoDevice = videoDevices.find(
          (device) => device.deviceId === currentVideoDeviceId
        );

        setCurrentVideoDevice(currentVideoDevice); // 현재 사용 중인 비디오 장치와 일치하는 장치 상태 관리 지정정
        setMyStreamManager(publisher); // 내 비디오 스트림 = 퍼블리셔(나)
        setPublisher(publisher); // 퍼블리셔 상태 관리 지정정
      } catch (err) {
        console.error("에러 발생", err);
      }
    },
    [myNickName]
  );

  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
      // 세션 끊기기
    }

    setOV(undefined);
    setSession(undefined);
    setSubscribers([]);
    setSessionId(null);
    setMyStreamManager(undefined);
    setPublisher(undefined);
  }, [session]);

  // 컴포넌트 언마운트 시 정리 - 방 나갔을 때
  useEffect(() => {
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [session]);

  const createSession = async (sessionId) => {
    try {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/sessions`,
        { customSessionId: sessionId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("세션 생성 오류:", error);
      throw error;
    }
  };

  const createToken = async (sessionId) => {
    try {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("토큰 생성 오류:", error);
      throw error;
    }
  };

  const getToken = useCallback(async () => {
    try {
      const mySessionId = await createSession(sessionId);
      return await createToken(mySessionId);
    } catch (error) {
      console.error("토큰 획득 오류:", error);
      throw error;
    }
  }, [sessionId]);

  return (
    <div>
      <p>방번호: {battleId}</p>
      <h1>대기실: {roomName}</h1>
      <p>방장: {roomMaster}</p>
    </div>
  );
}

export default BattleWaitingPage;
