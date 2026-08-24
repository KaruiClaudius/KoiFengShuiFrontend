// Polyfill for Node 22+ where global localStorage is experimental and undefined without flag;
// jsdom provides window.localStorage – ensure globalThis.localStorage points to it.
// Also provides an in-memory fallback for environments where jsdom hasn't initialized yet.
(function ensureLocalStorage() {
  const hasUsable = () => {
    try {
      const cur = globalThis.localStorage;
      return cur && typeof cur.getItem === "function" && typeof cur.setItem === "function";
    } catch {
      return false;
    }
  };
  if (hasUsable()) return;
  // try to reuse jsdom's window.localStorage if available
  let candidate = null;
  try {
    if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.getItem === "function") {
      candidate = window.localStorage;
    } else if (typeof globalThis.window !== "undefined" && globalThis.window.localStorage) {
      candidate = globalThis.window.localStorage;
    }
  } catch { void 0; }
  if (candidate) {
    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: candidate,
        writable: true,
        configurable: true,
      });
    } catch {
      try {
        globalThis.localStorage = candidate;
      } catch { void 0; }
    }
    if (hasUsable()) return;
  }
  // fallback: simple in-memory mock
  const store = new Map();
  const mock = {
    getItem(k) {
      return store.has(String(k)) ? store.get(String(k)) : null;
    },
    setItem(k, v) {
      store.set(String(k), String(v));
    },
    removeItem(k) {
      store.delete(String(k));
    },
    clear() {
      store.clear();
    },
    key(n) {
      return Array.from(store.keys())[n] || null;
    },
    get length() {
      return store.size;
    },
  };
  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: mock,
      writable: true,
      configurable: true,
    });
  } catch {
    try {
      globalThis.localStorage = mock;
    } catch { void 0; }
  }
})();
const K = { access: "auth.access", refresh: "auth.refresh", user: "auth.user", exp: "auth.expiresAt" };
let refreshPromise = null;
let timer = null;
export const getAccessToken = () => localStorage.getItem(K.access);
export const getRefreshToken = () => localStorage.getItem(K.refresh);
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(K.user) || "null");
  } catch {
    return null;
  }
};
export const getExpiresAt = () => Number(localStorage.getItem(K.exp) || 0);
export function setTokens({ token, refreshToken, expiresInMinutes, id, fullName, email, roleId }) {
  if (token) localStorage.setItem(K.access, token);
  if (refreshToken) localStorage.setItem(K.refresh, refreshToken);
  if (id) localStorage.setItem(K.user, JSON.stringify({ accountId: id, id, fullName, email, roleId }));
  if (expiresInMinutes) localStorage.setItem(K.exp, String(Date.now() + expiresInMinutes * 60 * 1000));
  scheduleProactiveRefresh();
}
export function clearAuth() {
  Object.values(K).forEach((k) => localStorage.removeItem(k));
  ["token", "user", "email"].forEach((k) => localStorage.removeItem(k));
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  refreshPromise = null;
}
export function setUser(user) {
  if (user == null) return;
  localStorage.setItem(K.user, JSON.stringify(user));
}
export function setRefreshPromise(p) {
  refreshPromise = p;
}
export function getRefreshPromise() {
  return refreshPromise;
}
export function clearRefreshPromise() {
  refreshPromise = null;
}
function scheduleProactiveRefresh() {
  if (timer) clearTimeout(timer);
  const exp = getExpiresAt();
  if (!exp) return;
  const delay = Math.max(0, exp - Date.now() - ((exp - Date.now()) / 2));
  timer = setTimeout(async () => {
    const rt = getRefreshToken();
    if (!rt) return;
    try {
      const path = "./auth.js";
      const mod = await import(/* @vite-ignore */ path);
      await mod.refreshToken();
    } catch { void 0; }
  }, delay);
}
export function __resetForTests() {
  if (timer) clearTimeout(timer);
  timer = null;
  refreshPromise = null;
}
