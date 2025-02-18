import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { createContext, useContext } from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useBattleStore } from "../store/Battle/BattleStore";
import useUserStore from "../store/User/UserStore";

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
  const [readyList, setReadyList] = useState([]);
  const [myReady, setMyReady] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [battlers, setBattlers] = useState([]);
  const [gameInfo, setGameInfo] = useState({});
  const [participants, setParticipants] = useState([]);
  const [myScores, setMyScores] = useState({});
  const [myRole, setMyRole] = useState(null);
  const [isTimeExtended, setIsTimeExtended] = useState(false);
  const [gameResult, setGameResult] = useState({});
  const [myResult, setMyResult] = useState(null);
  const [isBattleEnded, setIsBattleEnded] = useState(false);
  const [isDraw, setIsDraw] = useState(false);

  const battleInfo = useBattleStore((s) => s.battleInfo);
  const userId = useUserStore((s) => s.userId);

  const getResponse = useCallback((response) => {
    console.log("[WS] getResponse 호출됨, raw response:", response);

    try {
      const { success, type, data, error } = response;
      console.log("[WS] 응답 분해:", { success, type, data });

      switch (type) {
        case "ERROR":
          setError(error); // 에러 메세지 .. 구조 분해 다시
          break;
        case "ROOM_STATUS":
          if (data.readyUsers) {
            setReadyList((prev) => [...prev, data.readyUsers]);
          }
          if (data.voteInfo) {
            setVote({
              title: data.voteInfo.title,
              content: data.voteInfo.content,
              option1: data.voteInfo.options[0]?.optionTitle,
              option2: data.voteInfo.options[1]?.optionTitle,
              option1Id: data.voteInfo.options[0]?.optionId,
              option2Id: data.voteInfo.options[1]?.optionId,
            });
            setIsVoteSubmitted(true);
          }
          break;
        case "CHAT":
          if (success) {
            setMessageList((prev) => {
              const newList = [...prev, data];
              return newList;
            });
          }
          break;
        case "VOTE_CREATE":
          if (success) {
            setVote({
              title: data.title,
              content: data.content,
              option1: data.options[0]?.optionTitle,
              option2: data.options[1]?.optionTitle,
              option1Id: data.options[0]?.optionId,
              option2Id: data.options[1]?.optionId,
            });
            setIsVoteSubmitted(success);
            const content = `방장이 투표를 등록했습니다.`;
            const newMsg = {
              nickname: "SYSTEM",
              content,
            };
            setMessageList((prev) => {
              const newList = [...prev, newMsg];
              return newList;
            });
          }
          break;
        case "BATTLE_READY":
          if (data.ready) {
            setReadyList((prev) => [...prev, data]);
          } else {
            setReadyList((prev) =>
              prev.filter((p) => p.nickname !== data.nickname)
            );
          }
          if (data.nickname === battleInfo.participantName) {
            setMyReady(data.ready);
          }
          break;
        case "BATTLE_START":
          if (success) {
            setGameInfo(data);
            setVote({
              title: data.voteInfo.title,
              content: data.voteInfo.content,
              option1: data.voteInfo.options[0]?.optionTitle,
              option2: data.voteInfo.options[1]?.optionTitle,
              option1Id: data.voteInfo.options[0]?.optionId,
              option2Id: data.voteInfo.options[1]?.optionId,
            });
            setIsVoteSubmitted(true);
            setIsStarted(success);
            const me = data.participants.filter((p) => {
              p.userId === userId;
            });
            setMyScores({
              supportScore: me.supportScore,
              point: me.point,
            });
            setMyRole(me.role);
          }
          break;
        case "BATTLER_SELECT":
          if (success) {
            setBattlers([data.firstBattler, data.secondBattler]);
            const content = `${data.firstBattler.nickname}님과 ${data.secondBattler.nickname}님이 배틀러로 선정되셨습니다.`;
            const newMsg = {
              nickname: "SYSTEM",
              content,
            };
            setMessageList((prev) => {
              const newList = [...prev, newMsg];
              return newList;
            });
          }
          break;
        case "TIME_EXTENSION":
          if (success) {
            setIsTimeExtended(true);
            const content = `${data.nickname}님이 5분 시간 추가하셨습니다.`;
            const newMsg = {
              nickname: "SYSTEM",
              content,
            };
            setMessageList((prev) => {
              const newList = [...prev, newMsg];
              return newList;
            });
          }
          break;
        case "BATTLE_END":
          if (success) {
            setGameResult(data);
            const me = data.userResults.filter((p) => {
              p.userId === userId;
            });
            setMyResult(me);
            setIsDraw(data.winningInfo.draw);
            setIsBattleEnded(true);
          }
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
    async (url, token) => {
      console.log("연결 시도합니다.");

      // 초기 지연
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setWsStatus(WS_STATUS.CONNECTING);
      const wsUrl = `${url}/ws-connect`;

      const connectWithRetry = async (retryCount = 0, maxRetries = 3) => {
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

              // 구독 설정을 더 안정적으로 처리
              try {
                // 연결 후 잠시 대기
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // 이전 구독이 있다면 정리
                if (subscriptionsRef.current.private) {
                  subscriptionsRef.current.private.unsubscribe();
                }
                if (subscriptionsRef.current.public) {
                  subscriptionsRef.current.public.unsubscribe();
                }

                // 순차적 구독 처리
                console.log("Private 채널 구독 시도...");
                subscriptionsRef.current.private =
                  await channelSubscriptions.subscribePrivate(
                    stomp,
                    battleId,
                    getResponse
                  );

                // 구독 간 지연
                await new Promise((resolve) => setTimeout(resolve, 800));

                console.log("Public 채널 구독 시도...");
                subscriptionsRef.current.public =
                  await channelSubscriptions.subscribePublic(
                    stomp,
                    battleId,
                    getResponse
                  );

                console.log("모든 구독 완료");
              } catch (subscribeError) {
                console.error("Subscription error:", subscribeError);
                setError(subscribeError);
                // 구독 실패 시 재연결 시도
                if (retryCount < maxRetries) {
                  console.log(
                    `구독 실패, 재시도 ${retryCount + 1}/${maxRetries}`
                  );
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  await connectWithRetry(retryCount + 1);
                }
              }
            },
            onStompError: (frame) => {
              const errorMessage = frame.headers["message"];
              console.error("Broker reported error:", errorMessage);
              setError(new Error(errorMessage));
              setWsStatus(WS_STATUS.ERROR);

              // 에러 발생 시 현재 구독 정리
              if (subscriptionsRef.current.private) {
                subscriptionsRef.current.private.unsubscribe();
              }
              if (subscriptionsRef.current.public) {
                subscriptionsRef.current.public.unsubscribe();
              }

              // STOMP 에러 시 재연결 시도
              if (retryCount < maxRetries) {
                console.log(
                  `STOMP 에러, 재시도 ${retryCount + 1}/${maxRetries}`
                );
                setTimeout(() => connectWithRetry(retryCount + 1), 2000);
              }
            },
            onWebSocketError: async (error) => {
              console.error("WebSocket 연결 오류:", error);
              setError(error);
              setWsStatus(WS_STATUS.ERROR);

              // 현재 구독 정리
              if (subscriptionsRef.current.private) {
                subscriptionsRef.current.private.unsubscribe();
              }
              if (subscriptionsRef.current.public) {
                subscriptionsRef.current.public.unsubscribe();
              }

              // WebSocket 에러 시 재연결 시도
              if (retryCount < maxRetries) {
                console.log(
                  `WebSocket 에러, 재시도 ${retryCount + 1}/${maxRetries}`
                );
                await new Promise((resolve) => setTimeout(resolve, 2000));
                await connectWithRetry(retryCount + 1);
              }
            },
          });

          stomp.activate();
        } catch (error) {
          console.error("연결 시도 중 오류:", error);
          setError(error);
          setWsStatus(WS_STATUS.ERROR);

          // 현재 구독 정리
          if (subscriptionsRef.current.private) {
            subscriptionsRef.current.private.unsubscribe();
          }
          if (subscriptionsRef.current.public) {
            subscriptionsRef.current.public.unsubscribe();
          }

          if (retryCount < maxRetries) {
            console.log(`일반 에러, 재시도 ${retryCount + 1}/${maxRetries}`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await connectWithRetry(retryCount + 1);
          }
        }
      };

      // 초기 연결 시도 시작
      await connectWithRetry();
    },
    [battleId]
  );

 const disconnectWS = useCallback(() => {
   if (stompClientRef.current) {
     setWsStatus(WS_STATUS.DISCONNECTED);

     try {
       const unsubscribePromises = Object.values(subscriptionsRef.current).map(
         (subscription) => {
           return new Promise((resolve) => {
             if (subscription) {
               subscription.unsubscribe();
               setTimeout(resolve, 100);
             } else {
               resolve();
             }
           });
         }
       );

       Promise.all(unsubscribePromises).then(() => {
         subscriptionsRef.current = {};

         setTimeout(() => {
           // 여기서 한번 더 체크
           if (stompClientRef.current) {
             stompClientRef.current.deactivate();
             stompClientRef.current = null;
           }
           setWsStatus(WS_STATUS.DISCONNECTED);
           setError(null);
         }, 200);
       });
     } catch (error) {
       console.error("Disconnect error:", error);
       setError("연결 종료 중 오류가 발생했습니다");
       setWsStatus(WS_STATUS.ERROR);
     }
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
              options,
            },
          })
        );
        setVote({
          title,
          content,
          battleId,
          options,
        });
        setIsVoteSubmitted(true);
      } catch (error) {
        console.error("투표 등록 실패:", error);
        setError("투표 등록에 실패했습니다.");
      }
    },
    [battleId, wsStatus]
  );

  const readyForBattle = useCallback(
    (userId, nickname, ready) => {
      try {
        stompClientRef.current?.send(
          `/api/publish/battle/${battleId}`,
          {},
          JSON.stringify({
            type: "BATTLE_READY",
            data: {
              userId,
              nickname,
              ready,
            },
          })
        );
      } catch (error) {
        console.error("준비 실패:", error);
        setError("준비에 실패했습니다.");
      }
    },
    [battleId, wsStatus]
  );

  const startBattle = useCallback(() => {
    try {
      stompClientRef.current?.send(
        `/api/publish/battle/${battleId}`,
        {},
        JSON.stringify({
          type: "BATTLE_START",
        })
      );
    } catch (error) {
      console.error("시작 실패:", error);
      setError("배틀 시작 실패했습니다.");
    }
  }, [battleId, wsStatus]);

  const resultBattler = useCallback(() => {
    try {
      stompClientRef.current?.send(
        `/api/publish/battle/${battleId}`,
        {},
        JSON.stringify({
          type: "BATTLER_SELECT",
        })
      );
    } catch (error) {
      console.error("알림 실패:", error);
      setError("배틀러 알림 실패했습니다.");
    }
  }, [battleId, wsStatus]);

  const timeExtention = useCallback(() => {
    try {
      stompClientRef.current?.send(
        `/api/publish/battle/${battleId}`,
        {},
        JSON.stringify({
          type: "TIME_EXTENSION",
        })
      );
    } catch (error) {
      console.error("시간 연장 실패:", error);
      setError("시간 연장에 실패했습니다.");
    }
  }, [battleId, wsStatus]);

  const finishBattle = useCallback(() => {
    try {
      stompClientRef.current?.send(
        `/api/publish/battle/${battleId}`,
        {},
        JSON.stringify({
          type: "BATTLE_END",
        })
      );
    } catch (error) {
      console.error("종료 실패:", error);
      setError("배틀 종료 실패했습니다.");
    }
  }, [battleId, wsStatus]);

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
    vote,
    readyForBattle,
    readyList,
    myReady,
    startBattle,
    battlers,
    gameInfo,
    isStarted,
    resultBattler,
    timeExtention,
    isTimeExtended,
    finishBattle,
    gameResult,
    myScores,
    setMyScores,
    myRole,
    myResult,
    isDraw,
    isBattleEnded,
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

export { useWebSocketContext };
export default WebSocketProvider;
