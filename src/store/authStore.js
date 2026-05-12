import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  authLoading: true,

  setUser: (user) => set({ user, authLoading: false }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  clearAuth: () => set({ user: null, userProfile: null, authLoading: false }),
}));
