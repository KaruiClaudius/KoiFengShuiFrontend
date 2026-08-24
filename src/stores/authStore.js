import { create } from "zustand";
import {
  getUser,
  setTokens,
  setUser as persistUser,
  clearAuth,
} from "../api/tokenManager.js";
import { logout as apiLogout } from "../api/auth.js";

export const useAuthStore = create((set) => ({
  user: getUser(),

  login: ({
    newToken,
    newUser,
    email,
    token,
    refreshToken,
    expiresInMinutes,
    id,
    fullName,
    roleId,
  }) => {
    setTokens({
      token: newToken ?? token,
      refreshToken,
      expiresInMinutes,
      id: newUser?.accountId ?? newUser?.id ?? id,
      fullName: newUser?.fullName ?? fullName,
      email: newUser?.email ?? email,
      roleId: newUser?.roleId ?? roleId,
    });
    if (newUser) persistUser(newUser);
    set({ user: getUser() });
  },

  updateUser: (nextUser) => {
    persistUser(nextUser);
    set({ user: nextUser });
  },

  logout: () => {
    apiLogout().catch(() => {});
    clearAuth();
    set({ user: null });
  },
}));

export const selectIsLoggedIn = (state) => !!state.user;
export const selectIsAdmin = (state) => state.user?.roleId === 1;
