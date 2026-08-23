import { describe, it, expect, beforeEach } from "vitest";
import * as tm from "../api/tokenManager";
beforeEach(() => localStorage.clear());
describe("tokenManager", () => {
  it("stores and reads token pair + user + expiresAt", () => {
    tm.setTokens({ token: "a.jwt", refreshToken: "r.tok", expiresInMinutes: 15, id: 42, fullName: "A", email: "a@b.c", roleId: 2 });
    expect(tm.getAccessToken()).toBe("a.jwt");
    expect(tm.getRefreshToken()).toBe("r.tok");
    expect(tm.getUser()).toEqual(expect.objectContaining({ accountId: 42 }));
  });
  it("clear removes all keys", () => {
    tm.setTokens({ token: "x", refreshToken: "y", expiresInMinutes: 15, id: 1, fullName: "A", email: "a@b.c" });
    tm.clearAuth();
    expect(tm.getAccessToken()).toBeNull();
  });
});
