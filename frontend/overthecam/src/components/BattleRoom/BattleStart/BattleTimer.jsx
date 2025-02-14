import { useEffect, useState, useRef } from "react";
import { ClockIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import TimeBuyModal from "./BattleStartModal/BattleTimeBuyModal";

function BattleTimer({ onTimerStoped }) {
  const MINUTES_IN_MS = 10 * 60 * 1000; // 10분 시간 주기
  const ALERT_MINTS_IN_MS = 2 * 60 * 1000; // 2분 전부터 알람 주기
  const INTERVAL = 1000; // 1초 (1000ms) 간격으로 타이머 설정정
  const [timeLeft, setTimeLeft] = useState(MINUTES_IN_MS);

  const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(
    2,
    "0"
  );
  const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");

  const [isTwoMiNLeft, setIsTwoMinLeft] = useState(false);
  const timeBuyModal = useRef();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - INTERVAL);
    }, INTERVAL);

    if (timeLeft <= 0) {
      clearInterval(timer);
      onTimerStoped("게임이 종료 되었습니다.");
    } else if (timeLeft <= ALERT_MINTS_IN_MS && !isTwoMiNLeft) {
      setIsTwoMinLeft(true);
      onTimerStoped("2분 남았습니다. 더 이상 시간을 구매 할 수 없습니다.");
    }
    return () => {
      clearInterval(timer);
    };
  }, [timeLeft]);

  return (
    <div className="flex items-center gap-2 px-2">
      <div
        className={`text-${
          isTwoMiNLeft ? "cusRed" : "cusBlack"
        } text-2xl font-bold flex items-center gap-2`}
      >
        <ClockIcon className="w-7 h-7" />
        <p>
          {minutes}:{second}
        </p>
      </div>
      {/* 설정 버튼 */}
      <div
        onClick={() => timeBuyModal.current?.showModal()}
        className="rounded-sm hover:border hover:border-gray-800"
      >
        <PlusCircleIcon className="w-5 h-5 text-gray-600" />
      </div>
      <TimeBuyModal ref={timeBuyModal}/>
    </div>
  );
}

export default BattleTimer;
