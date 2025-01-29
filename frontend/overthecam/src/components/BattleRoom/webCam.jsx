import React, { useState, useEffect, useContext } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import UserVideoComponent from "./UserVideoComponent";
import { DocentContext } from "../../docent/DocentPage";

const APPLICATION_SERVER_URL = "http://localhost:5000/";

function WebCam({ MysessionId, myUserName }) {
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const { mic, cam } = useContext(DocentContext);

  useEffect(() => {
    joinSession();
    return () => {
      console.log("leaveSession 호출");
      leaveSession();
    };
  }, []);

  useEffect(() => {
    if (publisher) {
      publisher.publishAudio(!mic);
    }
  }, [mic, publisher]);

  useEffect(() => {
    if (publisher) {
      publisher.publishVideo(!cam);
    }
  }, [cam, publisher]);

  const joinSession = async () => {
    console.log("joinSession  호출! sessionId는 " + MysessionId);
    const OV = new OpenVidu();
    const mySession = OV.initSession();

    mySession.on("streamCreated", (event) => {
      if (
        event.stream.connection.connectionId !==
        mySession.connection.connectionId
      ) {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
        // 스트림의 username이 'host'일 때 메인 스트림으로 해주기
        const name = JSON.parse(event.stream.connection.data).clientData;
        if (name === "host") {
          console.log("호스트 입장!!");
          handleMainVideoStream(subscriber);
        }
      }
    });

    mySession.on("streamDestroyed", (event) => {
      setSubscribers((prevSubscribers) =>
        prevSubscribers.filter(
          (sub) => sub.stream.streamId !== event.stream.streamId
        )
      );
    });

    try {
      const token = await getToken();
      await mySession.connect(token, { clientData: myUserName });

      const publisher = OV.initPublisher(undefined, {
        publishAudio: true,
        publishVideo: true,
      });

      await mySession.publish(publisher);

      console.log("Publisher의 Stream ID:", publisher.stream.streamId);

      setSession(mySession);
      setPublisher(publisher);

      // 만약 나의 myUserName이 'host'일 경우 주요 비디오 스트림으로 설정합니다.
      // 녹화를 시작합니다.
      // streamId를 db에 저장합니다.
      if (myUserName === "host") {
        handleMainVideoStream(publisher);
        startRecording(MysessionId);
        await axios.post(
          APPLICATION_SERVER_URL +
            "api/exhibit/docent/" +
            MysessionId +
            "/" +
            publisher.stream.streamId
        );
      }
    } catch (error) {
      console.log(
        "There was an error connecting to the session:",
        error.code,
        error.message
      );
    }
  };

  const leaveSession = () => {
    subscribers.forEach((subscriber) => {
      session.unsubscribe(subscriber);
    });
    if (publisher) {
      session.unpublish(publisher);
    }

    if (session) {
      session.disconnect();
    }

    setSession(undefined);
    setSubscribers([]);
    setMainStreamManager(undefined);
    setPublisher(undefined);

    window.location.reload();
  };

  const startRecording = async (sessionId) => {
    await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/recording"
    );
  };

  const getToken = async () => {
    const sessionId = await createSession(MysessionId);
    const token = await createToken(sessionId);
    return token;
  };

  const createSession = async (MysessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
      { sessionId: MysessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  };

  const createToken = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      { username: myUserName },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  };

  const handleMainVideoStream = (stream) => {
    if (mainStreamManager !== stream) {
      setMainStreamManager(stream);
    }
  };

  return (
    <div>
      {session !== undefined ? (
        <div>
          <div className="stream-container">
            {publisher && (
              <div className="stream-item" key={publisher.stream.streamId}>
                <UserVideoComponent user="user" streamManager={publisher} />
              </div>
            )}
            {subscribers.map((sub) => (
              <div className="stream-item" key={sub.stream.streamId}>
                <UserVideoComponent user="user" streamManager={sub} />
              </div>
            ))}
          </div>

          {mainStreamManager !== undefined ? (
            <div>
              <UserVideoComponent
                user="docent"
                streamManager={mainStreamManager}
              />
            </div>
          ) : (
            <div>도슨트가 없어요</div>
          )}
        </div>
      ) : (
        <div>세션이 없어요.</div>
      )}
    </div>
  );
}
export default WebCam;
