import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "../../../../hooks/useWebSocket";
import { getReport } from "../../../../service/BattleRoom/api";
import useUserStore from "../../../../store/User/UserStore";

const BattleResultModal = forwardRef(function BattleResultModal(
  { onFinish },
  ref
) {
  const { myResult, isDraw, gameResult, myRole } = useWebSocketContext();
  const navigate = useNavigate();
  const [options, setOptions] = useState([
    { percentage: 0 },
    { percentage: 0 },
  ]);
  const dialogRef = useRef(null); // 내부 ref 추가
  const userId = useUserStore((s) => s.userId);
  const [isLoading, setIsLoading] = useState(false);
  const [resultHighlightColor, setResultHighlightColor] = useState(null);

  useEffect(() => {
    if (gameResult?.options?.length > 0) {
      setOptions(gameResult.options);
    }
  }, [gameResult]);

  useEffect(() => {
    const color = myResult?.winner ? "bg-green-200/70" : "bg-red-200/70";
    setResultHighlightColor(color);
  }, [myResult]);

  // useImperativeHandle을 통해 외부에서 사용할 메서드 노출
  useImperativeHandle(ref, () => ({
    showAlert: () => {
      dialogRef.current?.showModal();
    },
  }));

  // gameResult가 없을 때의 처리 추가
  if (!gameResult || !gameResult.options) {
    return null;
  }

  const onLeaveRoom = async () => {
    console.log("내 역할", myRole);
    dialogRef.current.close();
    setIsLoading(true); // 로딩 상태 활성화
    try {
      if (onFinish) {
        await onFinish(); // cleanup + 배틀 종료 요청
        await getReport(userId);
      }

      // 모든 정리 작업이 완료된 후 페이지 이동
      setIsLoading(false);
      if (myRole.includes("BATTLER")) {
        // window.location.href = "/main/mypage";
        navigate("/main/mypage");
      } else {
        // window.location.href = "/main/battle-list";
        navigate("/main/battle-list");
      }
    } catch (error) {
      console.error("세션 정리 중 오류:", error);
      setIsLoading(false);
      // 오류 처리 로직 (선택사항)
    }
  };

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center h-screen bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4">
            <img
              src="/assets/loading2.gif"
              alt="Loading animation"
              className="h-24 w-40"
            />
            <h3 className="text-xl font-bold">이동 중</h3>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </div>
      )}
      <dialog
        ref={dialogRef}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Header */}
          <h4 className="text-xl font-bold text-cusBlack">게임 종료</h4>

          <h4 className="text-lg font-semibold text-cusBlack">
            {gameResult.battleTitle}
          </h4>
          {/* 투표 결과 그래프 */}
          <div className="relative h-12 !rounded-full overflow-hidden mb-8">
            <div className="flex h-full w-[350px]">
              <div
                className="h-full clay bg-cusRed flex items-center justify-start pl-4 text-white font-bold transition-all duration-300"
                style={{
                  width: `${options[0]?.percentage || 50}%`,
                }}
              >
                {options[0]?.percentage || 0}% {options[0]?.optionTitle}
              </div>
              <div
                className="h-full clay bg-cusBlue flex items-center justify-end pr-4 text-white font-bold transition-all duration-300"
                style={{
                  width: `${options[1]?.percentage || 50}%`,
                }}
              >
                {options[1]?.optionTitle} {options[1]?.percentage || 0}%
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          {isDraw ? (
            <>
              <h5 className="text-lg font-semibold text-cusBlack">
                게임이 무승부로 끝났습니다.
              </h5>
              <h5 className="text-lg font-semibold text-cusBlack">
                응원 점수를 획득하지 못했습니다.
              </h5>
            </>
          ) : (
            <>
              <h5 className="text-lg font-semibold text-cusBlack">
                {myResult.nickname} 님은{" "}
                <span
                  className={`${resultHighlightColor} px-2 py-1 rounded text-xl font-bold`}
                >
                  {myResult?.winner ? "승리" : "패배"}
                </span>{" "}
                하셨습니다.
              </h5>
              <h5 className="text-lg font-semibold text-cusBlack">
                응원 점수{" "}
                <span className="bg-yellow-200/70 px-2 py-1 rounded text-xl font-bold">
                  {myResult.resultScore}
                </span>{" "}
                점을 획득 하셨습니다.
              </h5>
            </>
          )}

          {/* Buttons */}
          <div className="flex w-full mt-2 justify-center">
            {myRole === "PARTICIPANT" ? (
              <button
                type="button"
                onClick={onLeaveRoom}
                className="btn py-2 px-4 bg-cusYellow hover:bg-cusYellow rounded-lg transition-all duration-300 font-semibold w-24"
              >
                확인
              </button>
            ) : (
              <button
                type="button"
                onClick={onLeaveRoom}
                className="btn py-2 px-4 bg-cusYellow hover:bg-cusYellow rounded-lg transition-all duration-300 font-semibold"
              >
                내 발화 분석 리포트 보러가기
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
});

export default BattleResultModal;