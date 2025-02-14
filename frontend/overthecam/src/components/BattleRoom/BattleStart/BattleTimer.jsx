import { useEffect, useState } from "react";

function BattleTimer({ onTimerStoped }) {
  const MINUTES_IN_MS = 2 * 60 * 1000; // 10분 시간 주기
  const ALERT_MINTS_IN_MS = 2 * 60 * 1000; // 2분 전부터 알람 주기
  const INTERVAL = 1000; // 1초 (1000ms) 간격으로 타이머 설정정
  const [timeLeft, setTimeLeft] = useState(MINUTES_IN_MS);

  const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(
    2,
    "0"
  );
  const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");

  const [isTwoMiNLeft, setIsTwoMinLeft] = useState(false);

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
    <>
      <div
        className={`text-${
          isTwoMiNLeft ? "red" : "black"
        }-500 text-2xl font-bold px-5`}
      >
        <p>
          {minutes}:{second}
        </p>
      </div>
    </>
  );
}

export default BattleTimer;
