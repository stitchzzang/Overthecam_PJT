import { create } from "zustand"

const useUserStore = create((set) => ({
  userId: null,
  isLoggedIn: false,
  setUser: (id) => set({ userId: id, isLoggedIn: true }),
  clearUser: () => set({ userId: null, isLoggedIn: false }),
}))

export default useUserStore