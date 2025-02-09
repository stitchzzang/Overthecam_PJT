import {create} from "zustand";

export const useBattleInitStore = create((set) => ({
  battleInfo: {
    battleId: null,
    title: null,
    sessionId: null,
    connectionToken: null,
    isMaster: null,
  },

  setBattleInfo: (info) =>
    set({
      battleInfo: {
        battleId: info.battleId,
        title: info.title,
        sessionId: info.sessionId,
        connectionToken: info.connectionToken,
        isMaster: info.isMaster,
      },
    }),

  clearBattleInfo: () =>
    set({
      battleInfo: {
        battleId: null,
        title: null,
        sessionId: null,
        connectionToken: null,
        isMaster: null,
      },
    }),
}));