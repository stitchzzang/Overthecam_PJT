import { useEffect, useState } from "react";

function BattleTimer() {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - INTERVAL);
    }, INTERVAL);

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("타이머가 종료 되었습니다!");
    } else if (timeLeft <= ALERT_MINTS_IN_MS) {
      setIsTwoMinLeft(true);
    }
    return () => {
      clearInterval(timer);
    };
  }, [timeLeft]);

  return (
    <>
      <div style={{ color: isTwoMiNLeft ? "red" : "black" }} >
        <p>
          {minutes}:{second}
        </p>
      </div>
    </>
  );
}

export default BattleTimer;
