function BattleResultLoader({ isLoading }) {
  return isLoading ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4">
        <img
          src="/assets/loading2.gif"
          alt="Loading animation"
          className="h-16 w-16"
        />
        <h3 className="text-xl font-bold">결과 집계 중</h3>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  ) : null;
}

export default BattleResultLoader;