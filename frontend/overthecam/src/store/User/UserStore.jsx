import { create } from "zustand";

const useUserStore = create((set) => ({
  userId: null, // 명시적으로 초기값 설정
  isLoggedIn: false,
  userNickname: null,
  setUser: (userData) =>
    set((state) => {
      // console.log("setUser 호출됨, userData:", userData); // 디버깅용
      return {
        userId: userData.userId,
        isLoggedIn: userData.isLoggedIn,
        userNickname: userData.userNickname,
      };
    }),
  clearUser: () => set({ userId: null, isLoggedIn: false, userNickname: null }),
}));

export default useUserStore;
