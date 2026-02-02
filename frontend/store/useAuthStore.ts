import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasProfile: boolean | null; // null = not checked, true/false = checked
  _hasHydrated: boolean;
  login: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  setHasProfile: (value: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasProfile: null,
      _hasHydrated: false,
      login: (user, token) => set({ user, token }),
      updateUser: (updates) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...updates } } : state,
        ),
      logout: () => set({ user: null, token: null, hasProfile: null }),
      setHasProfile: (value) => set({ hasProfile: value }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
