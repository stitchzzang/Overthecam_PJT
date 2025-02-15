import { createContext } from "react";
import useWebSocket from "../hooks/useWebSocket";

const WebSocketContext = createContext();

function WebSocketProvider({ children, battleId }) {
  const { client, connectWS, disconnectWS, isWsConnected } =
    useWebSocket(battleId);
}
