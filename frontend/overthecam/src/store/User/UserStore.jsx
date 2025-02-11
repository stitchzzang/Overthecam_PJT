import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      userId: null,
      isLoggedIn: false,
      userNickname: null,
      // token: null,
      setUser: (userData) =>
        set((state) => ({
          userId: userData.userId,
          isLoggedIn: userData.isLoggedIn,
          userNickname: userData.userNickname,
          // token: userData.token,
        })),
      clearUser: () => 
        set({ 
          userId: null, 
          isLoggedIn: false, 
          userNickname: null,
          // token: null,
        }),
    }),
    {
      name: 'user-storage', // localStorage에 저장될 키 이름
      storage: localStorage, // 사용할 스토리지 (기본값은 localStorage)
    }
  )
);

export default useUserStore;
