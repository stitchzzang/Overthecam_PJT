import React, { useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../../../hooks/useWebSocket";
import useUserStore from "../../../store/User/UserStore";
import { sendSTT } from "../../../service/BattleRoom/api";

const LiveSTT = ({ shouldStop }) => {
  const [fullTranscript, setFullTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const { isStarted } = useWebSocketContext();
  const userId = useUserStore((s) => s.userId);
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
      // 의도적으로 중지하지 않았고, 배틀이 진행 중이면 재시작
      if (!shouldStop && isStarted) {
        try {
          recognition.start();
          console.log("음성 인식 자동 재시작됨");
        } catch (e) {
          console.error("재시작 실패:", e);
        }
      } else {
        // 의도적인 중지라면 정상 종료 처리
        setListening(false);
        setTimeout(() => {
          sendDataToServer(userId, fullTranscript);
        }, 10000);
      }
    };

    recognition.onresult = (event) => {
      let newText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newText += event.results[i][0].transcript + " ";
      }
      setFullTranscript((prev) => prev + newText);
    };

    recognition.onerror = (event) =>
      console.error("Speech Recognition Error:", event.error);

    if (isStarted) {
      recognition.start();
    } // 배틀 시작과 동시에 start

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isStarted]);

  // shoulStop->부모 이벤트 발생 시 사용
  useEffect(() => {
    if (shouldStop && recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("STT 중단이 불가:", e);
      }
    }
  }, [shouldStop, listening]);

  const sendDataToServer = async (userId, text) => {
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
      {/* <p>🎤 STT 상태: {listening ? "Listening..." : "Idle"}</p>
      <p>📝 변환된 텍스트: {fullTranscript}</p> */}
    </div>
  );
};

export default LiveSTT;
