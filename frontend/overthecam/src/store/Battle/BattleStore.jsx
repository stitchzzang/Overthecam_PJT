import { create } from "zustand";

export const useBattleStore = create((set) => ({
  battleInfo: {
    participantName: null,
    roomName: null,
  },
  setBattleInfo: (info) =>
    set({
      battleInfo: {
        participantName: info.myNickName,
        roomName: info.roomTitle,
      },
    }),
  clearBattleInfo: () =>
    set({
      battleInfo: {
        participantName: null,
        roomName: null,
      },
    }),
}));
