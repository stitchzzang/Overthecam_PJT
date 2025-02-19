function BattleResultLoader({ isLoading }) {
  return isLoading ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cusRed"></div>
        <h3 className="text-xl font-bold">결과 집계 중</h3>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  ) : null;
}

export default BattleResultLoader;