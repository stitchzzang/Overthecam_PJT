import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useBattleStore } from "../../../store/Battle/BattleStore";
import { useWebSocketContext } from "../../../hooks/useWebSocket";

const LiveSTT = ({ onTranscriptionComplete, shouldStop }) => {
  const [fullTranscript, setFullTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const { isStarted } = useWebSocketContext();
  const battleInfo = useBattleStore((s) => s.battleInfo);
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

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      sendDataToServer(battleInfo.participantName, fullTranscript); //사용자 닉네임과 내용 전달
      if (onTranscriptionComplete) {
        onTranscriptionComplete(fullTranscript); // 배틀 완료 시 백으로 전달
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

  const sendDataToServer = async (userName, text) => {
    if (!text.trim()) return;
    try {
    //   await axios.post("https://your-backend.com/api/stt", { text });
      console.log("✅ STT 데이터 백업 성공:", userName, text);
    } catch (error) {
      console.error("❌ STT 데이터 백업 실패:", error);
      console.log("보내려고 한 데이터:", text);
    }
  };

  return (
    <div>
      <p>🎤 STT 상태: {listening ? "Listening..." : "Idle"}</p>
      <p>📝 변환된 텍스트: {fullTranscript}</p>
    </div>
  );
};

export default LiveSTT;
