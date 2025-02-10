import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "../../components/BattleRoom/UserVideo";
import BattleChating from "../../components/BattleRoom/BattleChating";
import BattleTimer from "../../components/BattleRoom/BattleTimer";

function BattleRoomPage() {
  // useState를 사용하여 state 관리
  const [myOV, setOV] = useState(null);
  // create 를 통해 들어온 사람은 isMaster true값을 가짐
  const location = useLocation();
  const { battleId, title, sessionId, connectionToken, isMaster } =
    location.state;
  const [roomTitle, setRoomTitle] = useState(title);
  const [mySessionId, setMySessionId] = useState(sessionId);
  const [token, setToken] = useState(connectionToken);
  const [myNickName, setmyNickName] = useState(
    `별명${Math.floor(Math.random() * 100)}`
  );
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined); // Main video of the page
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [isModerator, setisModerator] = useState(false); // 참가자 모드 상태 추가
  const [isWaiting, setIsWaiting] = useState(true); // 대기실
  const [players, setPlayers] = useState([]); // 렌더링 될 때 get 요청, 받아오기
  const [battlers, setBattlers] = useState([]);
  const [disconnectWebSocket, setDisconnectWebSocket] = useState(null);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const navigate = useNavigate();

  const OV = useRef(null); // useRef를 사용하여 변수에 대한 참조를 저장, 컴포넌트가 리렌더링되어도 변수에 대한 참조가 유지(값을 유지)
  const battleChatingRef = useRef(null); // BattleChating 컴포넌트에 대한 ref
  // useEffect 훅을 사용해서 컴포넌트 렌더링 시 특정 작업 실행하는 hook
  useEffect(() => {
    // handleBeforeUnload 함수 생성
    const handleBeforeUnload = (event) => {
      // 새로고침 시 경고 창 띄우기
      event.preventDefault();
      event.returnValue = "";
      leaveSession();
    };

    const handlePreventGoBack = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Chrome, Edge에서는 이 부분이 필요합니다.
      // confirm 대신 alert 사용
      const userConfirmed = window.confirm("정말 나가시겠습니까?");
      if (userConfirmed) {
        leaveSession();
      } else {
        // 히스토리를 다시 pushState로 추가하여 뒤로 가기를 무력화
        history.pushState(null, "", location.href);
      }
    };

    // 언마운트(페이지 이동 시, beforeunload) 시 세션 연결 해제(handleBeforeUnload 함수 실행)
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePreventGoBack);
    history.pushState(null, "", location.href); // 뒤로 가기 방지
    console.log(token)
    joinSession();

    return () => {
      // 언마운트 시 handleBeforeUnload 함수 실행하고 나서, 이전에 추가했던 이벤트 제거(메모리 누수 방지)
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePreventGoBack);

      leaveSession();
    };
    // 빈 배열을 넣어주면 컴포넌트가 마운트될 때만 실행되고 언마운트될 때만 실행
  }, []);

  // usecallback을 사용해서 함수 재생성 방지, 불필요한 리랜더링 감소소
  const joinSession = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
      }

      let moderator = false;
      if (isMaster) {
        moderator = true;
        setisModerator(moderator);
      }

      OV.current = new OpenVidu();
      OV.current.enableProdMode();
      OV.current.setAdvancedConfiguration({
         websocketURL: 'wss://i12d204.p.ssafy.io/openvidu'
      });
      const mySession = OV.current.initSession();

      // 세션 이벤트 핸들러 설정
      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers((subscribers) => [...subscribers, subscriber]);
      });

      mySession.on("streamDestroyed", (event) => {
        setSubscribers((subscribers) =>
          subscribers.filter((sub) => sub !== event.stream.streamManager)
        );
      });

      mySession.on("exception", (exception) => {
        console.warn("세션 예외 발생:", exception);
      });

      setSession(mySession);

      try {
        const userData =
          isModerator === true
            ? `${myNickName}-방장`
            : `${myNickName}-참여자자`;

        await mySession.connect(token, { clientData: userData });

        const publisher = await OV.current.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: false,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        // 발화 감지 설정
        if (isModerator === true) {
          publisher.on("publisherStartSpeaking", (event) => {
            setSpeakingUsers((prev) =>
              new Set(prev).add(publisher.stream.connection.connectionId)
            );
          });

          publisher.on("publisherStopSpeaking", (event) => {
            setSpeakingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(publisher.stream.connection.connectionId);
              return newSet;
            });
          });
        }

        publisher.on("streamCreated", (event) => {
          console.log("Publisher stream created:", event);
        });

        publisher.on("streamPlaying", () => {
          console.log("Publisher stream playing");
        });

        await mySession.publish(publisher);

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

        setCurrentVideoDevice(currentVideoDevice);
        setMainStreamManager(publisher);
        setPublisher(publisher);
      } catch (error) {
        console.error("세션 연결 중 오류 발생:", error);
      }
    },
    [myNickName]
  );
  // 세션 나가기 함수 수정
  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
    }

    // WebSocket 연결 해제
    if (disconnectWebSocket) {
      disconnectWebSocket();
    }

    // 방장이 나가면 새로운 방장을 선정하는 로직
    if (isModerator && subscribers.length > 0) {
      const newModerator = subscribers[0];
      // 참여자들에게 방장이 바뀐 것을 알림으로 알려줌
      session
        .signal({
          to: [],
          type: "newModerator",
          data: newModerator,
        })
        .then(() => {
          console.log("New moderator signal sent");
          console.log("새 방장: ", newModerator);
        })
        .catch(() => {
          console.error("error sending new moderator signal", error);
        });
    }
    // 상태 초기화
    OV.current = null;
    setSession(undefined);
    setSubscribers([]);
    setMySessionId("");
    setmyNickName("");
    setMainStreamManager(undefined);
    setPublisher(undefined);
    navigate("/battle-list");
  }, [session, isModerator, subscribers, disconnectWebSocket]);

  // 구독자 타입 확인 함수 수정
  const getSubscriberType = (subscriber) => {
    try {
      const data = JSON.parse(subscriber.stream.connection.data);
      // 정확한 문자열 비교를 위해 수정
      return data.clientData ? "Moderator" : "Joiner";
    } catch (error) {
      console.error("구독자 정보 파싱 오류:", error);
      return "Joiner";
    }
  };

  //배틀러 선정 핸들러
  const chooseBattlersHandler = (event) => {
    const battler = event;
    console.log("배틀러 선정");
    // 배틀러 선정
  };

  // 배틀 시작, 방장에게 권한을 줌
  const startBattle = async () => {
    if (players.length <= 6 && players.length > 1) {
      setIsCoupleMode(false);
    } else if (players.length == 2) {
      setIsCoupleMode(true);
    } else if (players.length == 1) {
      console.log("혼자서는 게임을 진행할 수 없습니다.");
    }
    // 배틀 시작 api 요청
    // await start(sessionId);
    // 2명이면 ai 판정 모드
    // 2명 이상이면 판정단 있는 모드
    setIsWaiting(false);
  };

  // 게임모드 진입 시
  useEffect(() => {}, [isWaiting]);

  return (
    <div className="container">
      {isWaiting ? (
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
            <div>
              <button onClick={startBattle}>게임 시작하기</button>
              <button>투표 만들기</button>
            </div>
            {isMaster ? <></> : <div></div>}
          </div>
          <div id="video-container" className="col-12">
            <div className="participant-name">
              <span>{myNickName} (나)</span>
              <UserVideoComponent streamManager={publisher} />
            </div>
          </div>
          {/* 다른 참여자들 표시 */}
          {subscribers.map((subscriber, i) => {
            return (
              <div className="col-md-6" key={i}>
                <div className="participant-name">
                  <span>다른 사람</span>
                  <UserVideoComponent streamManager={subscriber} />
                </div>
              </div>
            );
          })}
          <BattleChating onDisconnect={setDisconnectWebSocket} />
        </div>
      ) : (
        <div>
          <h1>게임모드</h1>
          <input
            className="btn btn-large btn-danger"
            type="button"
            id="buttonLeaveSession"
            onClick={leaveSession}
            value="Leave session"
          />
          <div id="video-container" className="col-12">
            <div>{!isWaiting && <BattleTimer />}</div>
            <div className="participant-name">
              <span>{myNickName} (나)</span>
              <UserVideoComponent streamManager={publisher} />
            </div>
          </div>
          {/* 다른 참여자들 표시 */}
          {subscribers.map((subscriber, i) => {
            return (
              <div className="col-md-6" key={i}>
                <div className="participant-name">
                  <span>다른 사람</span>
                  <UserVideoComponent streamManager={subscriber} />
                </div>
              </div>
            );
          })}
          <BattleChating onDisconnect={setDisconnectWebSocket} />
        </div>
      )}
    </div>
  );
}

export default BattleRoomPage;
