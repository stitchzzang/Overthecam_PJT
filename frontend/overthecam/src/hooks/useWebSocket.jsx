import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useCallback, useRef, useState } from "react";

// 훅 내부에서 쓰이는 개인 채널 구독 함수
const subscribePrivate = (client, battleId, onResponse) => {
  const privateSubscription = client.subscribe(
    `/user/queue/battle/${battleId}`,
    (response) => {
      try {
        const privateResponse = JSON.parse(response.body);
        onResponse?.(privateResponse);
        console.log(privateResponse.message);
      } catch (parseError) {
        console.log("개인 채널 응답 파싱 실패");
      }
    }
  );

  return privateSubscription;
};

// 훅 내부에서 쓰이는 전체 채널 구독 함수
const subscribePublic = (client, battleId, onResponse) => {
  const publicSubscription = client.subscribe(
    `/subscribe/battle/${battleId} `,
    (response) => {
      try {
        const publicResponse = JSON.parse(response.body);
        onResponse?.(publicResponse);
        console.log(publicResponse.message);
      } catch (parseError) {
        console.log("전체 채널 응답 파싱 실패패");
      }
    }
  );

  return publicSubscription;
};

const useWebSocket = (battleId) => {
  const [isWsConnected, setIsWsConnected] = useState(false);
  const stompClientRef = useRef();
  const subscriptionsRef = useRef({});

  const handleMessage = useCallback((response) => {
    const { type, code, data, message } = response;
    console.log("Received message:", message);
  }, []);

  // 핸드쉐이크용 함수
  const connectWS = useCallback((url, token) => {
    if (!url || !token) {
      console.log("URL과 토큰이 필요합니다");
      return;
    }

    try {
      const socket = new SockJS(url);
      const stomp = Stomp.over(socket);

      stomp.configure({
        connectHeaders: {
          Authorization: `Bearer ${token.replace("Bearer ", "")}`,
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("Connected successfully:", frame);
          stompClientRef.current = stomp;
          setIsWsConnected(true);

          // 바로 구독 설정
          subscriptionsRef.current.private = subscribePrivate(
            stomp,
            battleId,
            handleMessage
          );
          subscriptionsRef.current.public = subscribePublic(
            stomp,
            battleId,
            handleMessage
          );
        },
        onStompError: (frame) => {
          console.error("Broker reported error:", frame.headers["message"]);
          console.error("Additional details:", frame.body);
        },
        onWebSocketError: (error) => {
          console.error("WebSocket 연결 오류:", error);
        },
      });

      stomp.activate();
    } catch (error) {}
  }, []);

  const disconnectWS = useCallback(() => {
    // 구독 해제
    Object.values(subscriptionsRef.current).forEach((subscription) => {
      subscription?.unsubscribe();
    });
    // 연결 해제
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsWsConnected(false);
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnectWS();
    };
  }, [disconnectWS]);

  return {
    client: stompClientRef.current,
    connectWS,
    disconnectWS,
    isWsConnected
  };
};

export default useWebSocket;

