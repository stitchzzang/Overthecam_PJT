import React, { useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import useUserStore from "../../../store/User/UserStore";
import { sendSTT } from "../../../service/BattleRoom/api";

const LiveSTT = ({ shouldStop }) => {
  const [fullTranscript, setFullTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const { isStarted } = useWebSocketContext();
  const userId = useUserStore((s) => s.userId);
  const isDataSentRef = useRef(false); // 데이터 전송 여부를 추적하는 플래그
  const recognitionRef = useRef();
  const failToast = useRef();

  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      failToast.current?.showAlert("발화분석 기능을 사용할 수 없습니다.");
      return;
    }

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognitionRef.current = recognition;
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      console.log("대화 시작 ");
    };

    recognition.onend = () => {
      setListening(false);
      // 타임아웃 시간을 2초로 줄이고 참조 저장
      sendDataToServer(userId, fullTranscript);
    };

    recognition.onresult = (event) => {
      let newText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newText += event.results[i][0].transcript + " ";
      }
      setFullTranscript((prev) => prev + newText);
    };

    recognition.onerror = (event) => {
      console.error("음성 인식 오류:", event.error);
      // 치명적이지 않은 오류에서 인식 재시작 시도
      if (event.error !== "aborted" && event.error !== "not-allowed") {
        try {
          if (fullTranscript && fullTranscript.trim() !== "") {
            sendDataToServer(userId, fullTranscript);
          }
          recognition.start();
        } catch (e) {
          console.error("인식 재시작 실패:", e);
        }
      }
    };

    if (isStarted) {
      try {
        recognition.start();
      } catch (e) {
        console.error("인식 시작 실패:", e);
        failToast.current?.showAlert("음성 인식 시작에 실패했습니다.");
      }
    }

    return () => {
      // recognition 정리
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 정리 중 오류 무시
        }
      }

      // 언마운트 전 데이터 전송 (텍스트가 있는 경우)
      if (fullTranscript && fullTranscript.trim() !== "") {
        sendDataToServer(userId, fullTranscript);
      }
    };
  }, [isStarted, userId]);

  // shoulStop->부모 이벤트 발생 시 사용
  // shouldStop->부모 이벤트 발생 시 사용
  useEffect(() => {
    if (shouldStop && recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
        // 부모에 의해 중지될 때 즉시 데이터 전송
        if (fullTranscript && fullTranscript.trim() !== "") {
          sendDataToServer(userId, fullTranscript);
        }
      } catch (e) {
        console.error("STT 중단이 불가:", e);
      }
    }
  }, [shouldStop, listening]);

  const sendDataToServer = async (userId, text) => {
    // 이미 전송된 데이터면 무시
    if (isDataSentRef.current) {
      console.log("🔄 이미 데이터가 전송되었습니다. 중복 전송 방지");
      return;
    }

    try {
      const response = await sendSTT(userId, text);
      console.log("✅ STT 데이터 백업 성공:", response);
    } catch (error) {
      console.error("❌ STT 데이터 백업 실패:", error);
      console.log("보내려고 한 데이터:", text);
    }
  };

  return (
    <div>
      {/* <p className="z-index">🎤 STT 상태: {listening ? "Listening..." : "Idle"}</p>
      <p>📝 변환된 텍스트: {fullTranscript}</p> */}
    </div>
  );
};

export default LiveSTT;
