import { create } from "zustand";

export const useBattleStore = create((set) => ({
  battleInfo: {
    participantName: null,
    roomName: null, // roomTitle 대신 roomName으로 통일
    userToken: null, // token 대신 userToken으로 통일
    isMaster: null,
  },
  setBattleInfo: (info) =>
    set({
      battleInfo: {
        participantName: info.participantName,
        roomName: info.roomName,
        userToken: info.userToken,
        isMaster: info.isMaster,
      },
    }),
  clearBattleInfo: () =>
    set({
      battleInfo: {
        participantName: null,
        roomName: null,
        userToken: null,
        isMaster: null,
      },
    }),
}));
