import { useEffect, useState, useRef } from "react";
import { ClockIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import TimeBuyModal from "./BattleStartModal/BattleTimeBuyModal";
import { useWebSocketContext } from "../../../hooks/useWebSocket";

function BattleTimer({ onTimerStoped }) {
  const { isTimeExtended, finishBattle, error } = useWebSocketContext();
  const MINUTES_IN_MS = 10 * 60 * 1000; // 10분 시간 주기
  const EXTENDED_IN_MS = 5 * 60 * 1000; // 5분 연장
  const ALERT_MINTS_IN_MS = 2 * 60 * 1000; // 2분 전부터 알람 주기
  const INTERVAL = 1000; // 1초 간격

  const [timeLeft, setTimeLeft] = useState(MINUTES_IN_MS);
  const [isTwoMiNLeft, setIsTwoMinLeft] = useState(false);
  const [boughtTimeOnce, setBoughtTimeOnce] = useState(false);
  const timeBuyModal = useRef();

  // 시간 포맷팅
  const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(
    2,
    "0"
  );
  const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");

  // 메인 타이머 로직
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        // 시간이 다 되었을 때
        if (prevTime <= 0) {
          clearInterval(timer);
          finishBattle();
          onTimerStoped("게임이 종료 되었습니다.");
          return 0;
        }
        // 2분 남았을 때
        if (prevTime <= ALERT_MINTS_IN_MS && !isTwoMiNLeft) {
          setIsTwoMinLeft(true);
          onTimerStoped("2분 남았습니다. 더 이상 시간 구매가 불가합니다.");
        }
        return prevTime - INTERVAL;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isTwoMiNLeft, onTimerStoped]);

  // 시간 연장 처리
  useEffect(() => {
    if (isTimeExtended && !isTwoMiNLeft) {
      setTimeLeft((prevTime) => prevTime + EXTENDED_IN_MS);
      setBoughtTimeOnce(true);
    }
  }, [isTimeExtended, isTwoMiNLeft]);

  return (
    <div className="flex items-center gap-2 px-2">
      <div
        className={`text-${
          isTwoMiNLeft ? "cusRed" : "cusBlack"
        } text-2xl font-bold flex items-center gap-2`}
      >
        <ClockIcon className="w-7 h-7" />
        <p className="mx-2">
          {minutes}:{second}
        </p>
      </div>
      {!isTwoMiNLeft && !boughtTimeOnce ? (
        <div
          onClick={() => timeBuyModal.current?.showModal()}
          className="rounded-sm hover:border hover:border-gray-800"
        >
          <PlusCircleIcon className="w-5 h-5 text-gray-600" />
        </div>
      ) : (
        <></>
      )}
      <TimeBuyModal ref={timeBuyModal} />
    </div>
  );
}

export default BattleTimer;
