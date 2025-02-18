// AudioComponent.jsx
import { useEffect, useRef } from "react";
import { useWebSocketContext } from "../../hooks/useWebSocket";

function AudioComponent({ track, local }) {
  const audioRef = useRef(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const { isStarted } = useWebSocketContext();
  // isStarted가 상태 변경되면, true 일 때 녹음시작하게 하기

  useEffect(() => {
    if (track && audioRef.current) {
      try {
        track.attach(audioRef.current);
        console.log("Audio track attached successfully");
        // 오디오 트랙을 바로 녹음 시작
        startRecording(track.mediaStreamTrack);
      } catch (error) {
        console.error("Error attaching audio track:", error);
      }
      return () => {
        try {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
          track.detach(audioRef.current);
        } catch (error) {
          console.error("Error detaching audio track:", error);
        }
      };
    }
  }, [track]);

  const startRecording = (mediaStreamTrack) => {
    try {
      // 미디어 스트림 생성
      const stream = new MediaStream([mediaStreamTrack]);
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        const base64Audio = await blobToBase64(audioBlob);

        try {
          // Google Cloud STT API 호출
          const response = await fetch(
            "https://speech.googleapis.com/v1/speech:recognize",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GOOGLE_API_KEY}`,
              },
              body: JSON.stringify({
                config: {
                  encoding: "LINEAR16",
                  sampleRateHertz: 48000,
                  languageCode: "ko-KR",
                  enableSpeakerDiarization: true,
                  diarizationSpeakerCount: 2,
                },
                audio: {
                  content: base64Audio,
                },
              }),
            }
          );

          const result = await response.json();
          if (result.results) {
            setTranscriptions((prevTranscriptions) => [
              ...prevTranscriptions,
              ...result.results,
            ]);
          }

          // 녹음을 계속 진행 (연속 처리)
          mediaRecorderRef.current.start(10000); // 10초마다 데이터 처리
        } catch (error) {
          console.error("Google STT API error:", error);
        }
      };

      // 처음 녹음 시작, 10초마다 데이터 전송
      mediaRecorderRef.current.start(10000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  // Blob을 base64로 변환하는 함수
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return <audio ref={audioRef} autoPlay />;
}

export default AudioComponent;
