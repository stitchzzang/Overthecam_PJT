import React, { useEffect, useRef } from "react";
import OpenViduVideoComponent from "./OVvideo";

const UserVideoComponent = ({ streamManager }) => {
  if (!streamManager) return null;

  return (
    <div className="streamcomponent">
      <OpenViduVideoComponent streamManager={streamManager} />
    </div>
  );
};

export default UserVideoComponent;