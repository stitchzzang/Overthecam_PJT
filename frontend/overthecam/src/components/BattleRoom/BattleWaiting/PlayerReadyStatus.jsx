function PlayerReadyStatus({ isReady }) {
  if (!isReady) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 w-full h-full absolute" />
      <div className="z-10 bg-cusRed text-white px-6 py-2 rounded-full shadow-lg font-bold text-xl animate-bounce">
        READY!
      </div>
    </div>
  );
}

export default PlayerReadyStatus;
