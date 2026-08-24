import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null });
    vi.restoreAllMocks();
  });

  it("login stores user via tokenManager payload", () => {
    useAuthStore.getState().login({
      token: "a.jwt",
      refreshToken: "r.tok",
      expiresInMinutes: 15,
      id: 7,
      fullName: "An",
      email: "a@b.c",
      roleId: 2,
    });
    expect(useAuthStore.getState().user).toMatchObject({ accountId: 7 });
  });

  it("legacy login payload shape still works", () => {
    useAuthStore.getState().login({
      newToken: "t",
      newUser: { accountId: 3, fullName: "B", roleId: 1 },
    });
    expect(useAuthStore.getState().user).toMatchObject({ accountId: 3 });
  });

  it("logout clears user", () => {
    useAuthStore.getState().login({ token: "t", id: 1 });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("updateUser persists next user", () => {
    useAuthStore.getState().updateUser({ accountId: 9, fullName: "C", roleId: 2 });
    expect(useAuthStore.getState().user.fullName).toBe("C");
  });
});

describe("themeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
  });

  it("toggles light/dark and persists", () => {
    useThemeStore.getState().setTheme("light");
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("setTheme normalizes unknown values", () => {
    useThemeStore.getState().setTheme("banana");
    expect(useThemeStore.getState().theme).toBe("light");
  });
});
