import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { createContext, useContext } from "react";
import { useCallback, useRef, useState, useEffect } from "react";

// WebSocket 상태를 나타내는 상수
const WS_STATUS = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
};

// 채널 구독 함수들을 별도의 객체로 분리
const channelSubscriptions = {
  subscribePrivate: (client, battleId, onResponse) => {
    return client.subscribe(
      `/api/user/queue/battle/${battleId}`,
      (response) => {
        console.log(response);
        try {
          const privateResponse = JSON.parse(response.body);
          console.log(`[WS] 개인 채널 응답 파싱 성공:`, privateResponse);
          onResponse?.(privateResponse);
        } catch (parseError) {
          console.error("[WS] 개인 채널 응답 파싱 실패:", parseError);
        }
      }
    );
  },

  subscribePublic: (client, battleId, onResponse) => {
    return client.subscribe(`/api/subscribe/battle/${battleId}`, (response) => {
      try {
        const publicResponse = JSON.parse(response.body);
        console.log(`[WS] 전체 채널 응답 파싱 성공:`, publicResponse);
        onResponse?.(publicResponse);
      } catch (parseError) {
        console.error("[WS] 전체 채널 응답 파싱 실패:", parseError);
      }
    });
  },
};

const useWebSocket = (battleId) => {
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef({});
  const [wsStatus, setWsStatus] = useState(WS_STATUS.DISCONNECTED);
  const [messageList, setMessageList] = useState([]);
  const [isVoteSubmitted, setIsVoteSubmitted] = useState(false);
  const [vote, setVote] = useState({});
  const [error, setError] = useState(null);

  const getResponse = useCallback((response) => {
    console.log("[WS] getResponse 호출됨, raw response:", response);

    try {
      const { success, type, data } = response;
      console.log("[WS] 응답 분해:", { success, type, data });

      switch (type) {
        case "CHAT":
          setMessageList((prev) => {
            const newList = [...prev, data];
            return newList;
          });
          break;
        case "VOTE_CREATE":
          setVote({
            title: data.title,
            content: data.content,
            option1: data.options[0]?.optionTitle,
            option2: data.options[1]?.optionTitle
          })
          break;
        default:
          console.log(`[WS] 처리되지 않은 메시지 타입: ${type}`);
          break;
      }
    } catch (error) {
      console.error("[WS] 응답 처리 중 에러:", error);
      setError("응답이 없습니다.");
    }
  }, []);

  const connectWS = useCallback(
    (url, token) => {
      console.log("연결 시도합니다.")
      if (!url || !token) {
        setError(new Error("URL과 토큰이 필요합니다"));
        return;
      }

      setWsStatus(WS_STATUS.CONNECTING);
      const wsUrl = `${url}/ws-connect`;

      try {
        const stomp = Stomp.over(() => new SockJS(wsUrl));
        stompClientRef.current = stomp;

        stomp.configure({
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          onConnect: async (frame) => {
            console.log("Connected successfully:", frame);
            setWsStatus(WS_STATUS.CONNECTED);
            setError(null);

            // 구독 설정을 비동기적으로 처리
            try {
              await new Promise((resolve) => setTimeout(resolve, 500));
              subscriptionsRef.current.private =
                channelSubscriptions.subscribePrivate(
                  stomp,
                  battleId,
                  getResponse
                );

              await new Promise((resolve) => setTimeout(resolve, 500));
              subscriptionsRef.current.public =
                channelSubscriptions.subscribePublic(
                  stomp,
                  battleId,
                  getResponse
                );
            } catch (subscribeError) {
              console.error("Subscription error:", subscribeError);
              setError(subscribeError);
            }
          },
          onStompError: (frame) => {
            const errorMessage = frame.headers["message"];
            console.error("Broker reported error:", errorMessage);
            setError(new Error(errorMessage));
            setWsStatus(WS_STATUS.ERROR);
          },
          onWebSocketError: (error) => {
            console.error("WebSocket 연결 오류:", error);
            setError(error);
            setWsStatus(WS_STATUS.ERROR);
          },
        });

        stomp.activate();
      } catch (error) {
        setError(error);
        setWsStatus(WS_STATUS.ERROR);
      }
    },
    [battleId, getResponse]
  );

  const disconnectWS = useCallback(() => {
    Object.values(subscriptionsRef.current).forEach((subscription) => {
      subscription?.unsubscribe();
    });
    subscriptionsRef.current = {};

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setWsStatus(WS_STATUS.DISCONNECTED);
      setError(null);
    }
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (wsStatus !== WS_STATUS.CONNECTED) {
        console.error("웹소켓 연결이 되어있지 않습니다.");
        return;
      }

      try {
        stompClientRef.current?.send(
          `/api/publish/battle/${battleId}`,
          {},
          JSON.stringify({
            type: "CHAT",
            data: {
              content,
              timestamp: new Date().toISOString(),
            },
          })
        );
      } catch (error) {
        console.error("메시지 전송 실패:", error);
        setError("메세지 전송에 실패했습니다.");
      }
    },
    [battleId, wsStatus]
  );

  const createVote = useCallback(
    (title, content, options) => {
      try {
        stompClientRef.current?.send(
          `/api/publish/battle/${battleId}`,
          {},
          JSON.stringify({
            type: "VOTE_CREATE",
            data: {
              title,
              content,
              battleId,
              options
            },
          })
        );
        setVote({
          title,
          content,
          battleId,
          options
        })
        setIsVoteSubmitted(true)
      } catch (error) {
        console.error("투표 등록 실패:", error);
        setError("투표 등록에 실패했습니다.");
      }
    },
    [battleId, wsStatus]
  );

  useEffect(() => {
    return () => {
      disconnectWS();
    };
  }, [disconnectWS]);

  return {
    status: wsStatus,
    error,
    connectWS,
    disconnectWS,
    sendMessage,
    messageList,
    createVote,
    isVoteSubmitted,
    vote
  };
};

// Context 생성
const WebSocketContext = createContext(null);

// Provider 컴포넌트
function WebSocketProvider({ children, battleId }) {
  const wsHook = useWebSocket(battleId);

  if (!battleId) {
    console.warn("WebSocketProvider requires a battleId prop");
  }

  return (
    <WebSocketContext.Provider value={wsHook}>
      {children}
    </WebSocketContext.Provider>
  );
}

// 커스텀 훅으로 Context 사용을 간편화
function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}

export { WebSocketProvider, useWebSocketContext };
