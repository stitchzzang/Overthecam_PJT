import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      userNickname: null,
      userId: null,
      // token: null,
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setUserNickname: (nickname) => set({ userNickname: nickname }),
      setUserId: (id) => set({ userId: id }),
      setUserInfo: (info) => set((state) => ({
        ...state,
        isLoggedIn: info.isLoggedIn ?? state.isLoggedIn,
        userNickname: info.userNickname ?? state.userNickname,
        userId: info.userId ?? state.userId
      })),
      clearUserInfo: () => set({
        isLoggedIn: false,
        userNickname: null,
        userId: null
      }),
    }),
    {
      name: 'user-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 사용할 스토리지 (기본값은 localStorage)
    }
  )
);

export default useUserStore;
