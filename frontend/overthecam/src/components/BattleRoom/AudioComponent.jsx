// AudioComponent.jsx
import { useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../../hooks/useWebSocket";

function AudioComponent({ track, local }) {
  const audioRef = useRef(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const { isStarted } = useWebSocketContext();

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
          console.log("Cleanup: stopping recording and detaching track");
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
          if (recordingTimerRef.current) {
            clearTimeout(recordingTimerRef.current);
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
      console.log("Starting recording with mediaStreamTrack:", {
        kind: mediaStreamTrack.kind,
        enabled: mediaStreamTrack.enabled,
        id: mediaStreamTrack.id,
      });

      // 미디어 스트림 생성
      const stream = new MediaStream([mediaStreamTrack]);
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log(
          `Received data chunk: ${(e.data.size / 1024).toFixed(2)} KB`
        );
        chunksRef.current.push(e.data);
        console.log(chunksRef);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("MediaRecorder stopped, processing chunks...");
        if (chunksRef.current.length === 0) {
          console.log("No chunks to process, restarting recording");
          startNextRecordingSession();
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log(
          `Created audio blob: ${(audioBlob.size / 1024).toFixed(2)} KB`
        );

        try {
          const base64Audio = await blobToBase64(audioBlob);
          console.log("Base64 변환 완료, 길이:", base64Audio.length);

          console.log("Sending request to Google STT API...");
          // Google Cloud STT API 호출
          const response = await fetch(
            `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                config: {
                  encoding: "WEBM_OPUS",
                  sampleRateHertz: 48000,
                  languageCode: "ko-KR",
                  diarizationConfig: {
                    enableSpeakerDiarization: true,
                    maxSpeakerCount: 2,
                  },
                },
                audio: {
                  content: base64Audio,
                },
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error(`API request failed: ${response.status}`);
          }

          const result = await response.json();
          console.log("Received STT response:", result);

          if (result.results && result.results.length > 0) {
            console.log(`Got ${result.results.length} transcription results`);
            setTranscriptions((prevTranscriptions) => [
              ...prevTranscriptions,
              ...result.results,
            ]);
          } else {
            console.log("No transcription results found in response");
          }
        } catch (error) {
          console.error("Google STT API error:", error);
        } finally {
          // 청크 초기화
          chunksRef.current = [];
          // 다음 녹음 세션 시작
          startNextRecordingSession();
        }
      };

      // 처음 녹음 시작
      mediaRecorderRef.current.start();
      console.log("Recording started");

      // 30초 후에 녹음 중지 - 이렇게 하면 onstop 이벤트가 발생함
      scheduleRecordingStop();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const scheduleRecordingStop = () => {
    recordingTimerRef.current = setTimeout(() => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        console.log("Stopping recording after timer (30s)");
        mediaRecorderRef.current.stop();
      }
    }, 30000); // 30초
  };

  const startNextRecordingSession = () => {
    if (!mediaRecorderRef.current) {
      console.error("MediaRecorder not available");
      return;
    }

    try {
      if (mediaRecorderRef.current.state !== "recording") {
        mediaRecorderRef.current.start();
        console.log("Started new recording session");
        // 다음 중지 일정 설정
        scheduleRecordingStop();
      } else {
        console.warn(
          "MediaRecorder already recording, cannot start new session"
        );
      }
    } catch (error) {
      console.error("Error starting new recording session:", error);
    }
  };

  // Blob을 base64로 변환하는 함수
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div>
      <audio ref={audioRef} autoPlay />
      <div className="mt-4">
        {transcriptions.length === 0 && (
          <p className="text-gray-500">음성 인식 대기 중...</p>
        )}
        {transcriptions.map((result, index) => (
          <div key={index} className="border p-2 my-2">
            {result.alternatives && result.alternatives[0] && (
              <p>
                화자 {result.speakerTag || "unknown"}:{" "}
                {result.alternatives[0].transcript}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AudioComponent;
