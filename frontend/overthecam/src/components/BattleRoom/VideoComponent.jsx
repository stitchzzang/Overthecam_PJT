import { useEffect, useRef } from "react";

function VideoComponent({ track, participantIdentity, local = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (track && videoRef.current) {
      track.attach(videoRef.current);
      return () => {
        track.detach(videoRef.current);
      };
    }
  }, [track]);

  return (
    <div className="video-container aspect-square w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={local}
        className="video-element w-full h-full object-cover"
      />
    </div>
  );
}

export default VideoComponent;
