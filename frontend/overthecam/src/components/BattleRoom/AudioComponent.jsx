// AudioComponent.jsx
import { useEffect, useRef } from "react";

function AudioComponent({ track, local = false }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (track && audioRef.current) {
      try {
        track.attach(audioRef.current);
        console.log("Audio track attached successfully");
      } catch (error) {
        console.error("Error attaching audio track:", error);
      }
      return () => {
        try {
          track.detach(audioRef.current);
        } catch (error) {
          console.error("Error detaching audio track:", error);
        }
      };
    }
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
}

export default AudioComponent;
