import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "./permissions";

export interface User { name: string; email: string; role: Role; }

interface AuthState {
  user: User | null;
  remember: boolean;
  login: (u: User, remember: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      remember: true,
      login: (user, remember) => set({ user, remember }),
      logout: () => set({ user: null }),
    }),
    { name: "farm-session" },
  ),
);

interface UiState { collapsed: boolean; toggle: () => void; }
export const useUi = create<UiState>()(
  persist((set) => ({ collapsed: false, toggle: () => set((s) => ({ collapsed: !s.collapsed })) }), { name: "farm-ui" }),
);
