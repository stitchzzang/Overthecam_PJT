import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useBattleStore = create(
  persist(
    (set) => ({
      battleInfo: {
        battleId: 0,
        participantName: "",
        roomName: "",
        userToken: "",
        isMaster: false, // boolean 값은 false로 초기화
      },
      setBattleInfo: (info) =>
        set({
          battleInfo: {
            battleId: info.battleId || 0,
            participantName: info.participantName || "",
            roomName: info.roomName || "",
            userToken: info.userToken || "",
            isMaster: info.isMaster || false,
          },
        }),
      clearBattleInfo: () =>
        set({
          battleInfo: {
            battleId: 0,
            participantName: "",
            roomName: "",
            userToken: "",
            isMaster: false,
          },
        }),
    }),
    {
      name: "battle-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
