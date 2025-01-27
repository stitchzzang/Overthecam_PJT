import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";

const APPLICATION_SERVER_URL = "";

function BattleWaitingPage(props) {
  
  return (
    <div>
      <p>방번호: {props.battleId}</p>
      <h1>대기실: {props.roomName}</h1>
      <p>방장: {props.roomMaster}</p>
    </div>
  );
}

export default BattleWaitingPage;
