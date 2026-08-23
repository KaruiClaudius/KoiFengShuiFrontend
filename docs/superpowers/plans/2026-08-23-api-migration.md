# API Migration — Signed Agreement R1→R4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the frontend (React 18 + Vite, currently on legacy Marketplace/legacy-auth contracts) to the rebuilt backend (.NET 10, agreement hash `98e3247` / Council `d01bf0c` UI-fix) — refresh-token auth, marketplace deletion → community + partner shops, public Approved-only surfaces.

**Architecture:** Four waves, strict commit-per-task, lint+build+vision gates. R1 auth (isolated, no UI surface deletions). R2 marketplace deletion (hard remove 8 modules + nav/routes/dashboard widgets). R3 new surfaces (code-first against landed specs, Playwright-verified). R4 cleanup + tag. Minimal vitest added early for pure-logic units (`tokenManager`, `extractApiError`) — zero impact on existing lint/build; CI extended with `npm test` step.

**Tech Stack:** React 18.3, Vite 8.2 (rolldown), Tailwind 3.4, axios 1.7, Radix UI, react-router-dom 7.18, recharts 3, react-quill-new 3.7 + DOMPurify, vitest 2 + jsdom (new, minimal), Playwright headless for vision checks. Backend base: `VITE_API_URL || ""` → Vite proxy `→ https://localhost:7285` in dev, absolute origin in prod.

**Decisions locked (user, 2026-08-23):** (1) R3 code-first against spec (backend batch `fc78330`/`1e53d9e` already landed per 8.2 update → no blocking). (2) Add minimal vitest. (3) Google OAuth client id → `VITE_GOOGLE_CLIENT_ID`. (4) Q11 member "my submissions" question raised in Council before coding that piece — if backend cannot provide, ship submission-success-only ("Đang chờ duyệt") as accepted limitation.

---

## File Structure (what each file owns)

```
src/api/
  core.js                 — axios instance: baseURL, request interceptor (Bearer), response interceptor (401→refresh once→replay, else clear+redirect), export extractApiError()
  tokenManager.js         — NEW: localStorage keys (auth.access / auth.refresh / auth.user / auth.expiresAt), getters/setters/clear, single-flight refresh promise, proactive half-life timer
  auth.js                 — NEW: thin wrappers for SignIn/SignUp/Google/Forgot/Reset/ProfileStatus/Refresh/Logout against guide paths
  posts.js                — EXISTING: add/unify public `getPostDetail(id)` legacy-envelope adapter, keep BlogPage helpers, align to new PostResponse imageUrls
  community.js            — NEW: getFeed({postTypeId,q,page}), getPostById(id), createPost(imageIds+fields), uploadImage→{imageId,url}
  partners.js             — NEW: public list/detail + admin CRUD for api/partner-shops
  dashboard.js            — PRUNE: remove getNewMarketListingsCount/ByCategory + unused getTotalTransaction, ADD getContentSummary
  faqs.js / compatibility.js / element.js — keep; faq create drop accountId

src/context/
  AuthContext.jsx         — REWRITE onto tokenManager + auth.js, expose same {user,login,logout,updateUser,isAuthenticated} (9 consumers) but backed by token-pair

src/pages/Auth/
  AuthPage.jsx            — replace 2 literal-string branches with code-based extractApiError, dob→type=date (YYYY-MM-DD), password min 8
  ResetPasswordPage.jsx   — NEW: reads ?token=, posts ResetPassword

src/pages/
  UserProfile/UserProfile.jsx — load via GET /api/Account/{ownId} (was email lookup), drop wallet, elementId-preferred chips
  Dashboard/*            — remove marketplace cards/charts, add content-summary widget + pending badge
  Community/*            — NEW: /community feed + /community/submit form (imageIds flow), status chip "Đang chờ duyệt" (no my-list yet → Q11)
  Partners/*             — NEW: public directory + admin CRUD (AdminShell)
  BlogDetail/*, AdminPost/*, FAQ/FAQManager.jsx — migrate to new shapes (Pending/Approved vocabulary, imageUrls casing, drop client active-filter)

src/constants/
  postTypes.js            — NEW interim {BLOG:3, COMMUNITY:1} until categories endpoint consumed (then deleted)

src/utils/
  shareResult.js          — DELETE with marketplace
  errors.js (optional)    — or export lives in core.js; choose core.js to avoid new util file (keep file count low)

vitest.config.js          — NEW
src/__tests__/tokenManager.test.js, src/__tests__/extractApiError.test.js

vite.config.js, .env.example, tailwind.config.js, postcss.config.js — postcss already restored (d01bf0c)

routes:
  src/routes/paths.js + src/index.jsx — add /reset-password, /community, /community/submit, /partners, /admin/partners; remove /KoiListings, /Details/:id, /Decoration/:id, /ListingPost, /favorites; titles updated
```

---

## Pre-flight

### Task 0: Vitest minimal setup (must land before R1 logic tests)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/__tests__/tokenManager.test.js` (placeholder, filled in R1)
- Create: `src/__tests__/extractApiError.test.js` (placeholder)

- [ ] **Step 0.1: Install dev deps**
  ```bash
  npm i -D vitest@^2 jsdom@^24
  ```
  Workdir: `C:\Users\Karui\Desktop\Works\KoiFengShuiFrontend`

- [ ] **Step 0.2: Create `vitest.config.js`**
  ```js
  import { defineConfig } from "vitest/config";
  export default defineConfig({
    test: {
      environment: "jsdom",
      include: ["src/__tests__/**/*.test.{js,jsx}"],
      globals: true,
    },
  });
  ```

- [ ] **Step 0.3: Add scripts to `package.json`**
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
  ```

- [ ] **Step 0.4: Verify**
  ```bash
  npm run test -- --run 2>&1 | Select-Object -Last 20
  npm run lint 2>&1 | Select-Object -Last 10
  npm run build 2>&1 | Select-Object -Last 10
  ```
  Expected: tests pass (0 tests, 0 failures), lint 0 errors / 28 warnings, build ok.

- [ ] **Step 0.5: Commit**
  ```bash
  git add package.json vitest.config.js
  git commit -m "test(vitest): minimal setup with jsdom for auth/error unit tests"
  git push origin main
  ```

---

## R1 — Auth Rewrite

### Task 1.1: tokenManager — storage + single-flight + proactive timer

**Files:**
- Create: `src/api/tokenManager.js`
- Test: `src/__tests__/tokenManager.test.js`

- [ ] **Step 1.1.1: Write failing test `src/__tests__/tokenManager.test.js`**
  ```js
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
  ```

- [ ] **Step 1.1.2: Run test to verify it fails**
  Run: `npm run test -- src/__tests__/tokenManager.test.js`
  Expected: FAIL — module not found / not implemented.

- [ ] **Step 1.1.3: Implement `src/api/tokenManager.js`**
  ```js
  const K = { access: "auth.access", refresh: "auth.refresh", user: "auth.user", exp: "auth.expiresAt" };
  let refreshPromise = null;
  let timer = null;
  export const getAccessToken = () => localStorage.getItem(K.access);
  export const getRefreshToken = () => localStorage.getItem(K.refresh);
  export const getUser = () => { try { return JSON.parse(localStorage.getItem(K.user) || "null"); } catch { return null; } };
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
    // legacy keys migration: remove old "token"/"user"/"email" if present
    ["token", "user", "email"].forEach((k) => localStorage.removeItem(k));
    if (timer) { clearTimeout(timer); timer = null; }
    refreshPromise = null;
  }
  export function setRefreshPromise(p) { refreshPromise = p; }
  export function getRefreshPromise() { return refreshPromise; }
  export function clearRefreshPromise() { refreshPromise = null; }
  function scheduleProactiveRefresh() {
    if (timer) clearTimeout(timer);
    const exp = getExpiresAt();
    if (!exp) return;
    const delay = Math.max(0, exp - Date.now() - ((exp - Date.now()) / 2));
    // import lazily to avoid cycle: will be set by core.js
    timer = setTimeout(async () => {
      const rt = getRefreshToken();
      if (!rt) return;
      try { const mod = await import("./auth.js"); await mod.refreshToken(); } catch {}
    }, delay);
  }
  export function __resetForTests() { if (timer) clearTimeout(timer); timer = null; refreshPromise = null; }
  ```

- [ ] **Step 1.1.4: Run test to verify it passes**
  Run: `npm run test -- src/__tests__/tokenManager.test.js`
  Expected: PASS.

- [ ] **Step 1.1.5: Commit**
  ```bash
  git add src/api/tokenManager.js src/__tests__/tokenManager.test.js
  git commit -m "feat(auth): tokenManager with pair storage, single-flight slot, proactive half-life timer"
  ```

### Task 1.2: extractApiError + core interceptor rewrite

**Files:**
- Modify: `src/api/core.js`
- Test: `src/__tests__/extractApiError.test.js`

- [ ] **Step 1.2.1: Write failing test**
  ```js
  import { describe, it, expect } from "vitest";
  import { extractApiError } from "../api/core";
  describe("extractApiError", () => {
    it("maps new code envelope", () => {
      const err = { response: { status: 400, data: { code: "ACCOUNT_NOT_FOUND", message: "Email not found." } } };
      expect(extractApiError(err).code).toBe("ACCOUNT_NOT_FOUND");
    });
    it("maps RFC7807 problem+json", () => {
      const err = { response: { status: 400, data: { title: "Validation", errors: { Email: ["Taken"] } } } };
      expect(extractApiError(err).message).toMatch(/Taken/);
    });
    it("handles raw string body", () => {
      const err = { response: { status: 400, data: "Email not found." } };
      expect(extractApiError(err).code).toBe("ACCOUNT_NOT_FOUND");
    });
    it("handles network error", () => {
      const err = { message: "Network Error", request: {} };
      expect(extractApiError(err).code).toBe("NETWORK_ERROR");
    });
  });
  ```

- [ ] **Step 1.2.2: Run — expect FAIL (extractApiError not exported)**

- [ ] **Step 1.2.3: Implement core.js rewrite**
  ```js
  import axios from "axios";
  import { getAccessToken, getRefreshToken, setTokens, clearAuth, getRefreshPromise, setRefreshPromise, clearRefreshPromise } from "./tokenManager.js";
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const api = axios.create({ baseURL: baseUrl });

  // map legacy string bodies to codes during transition
  const stringToCode = (s) => {
    const t = String(s || "").trim();
    if (/email not found/i.test(t)) return "ACCOUNT_NOT_FOUND";
    if (/incorrect password/i.test(t)) return "INVALID_PASSWORD";
    if (/already exists|taken/i.test(t)) return "EMAIL_TAKEN";
    return "UNKNOWN_ERROR";
  };

  export function extractApiError(err) {
    const res = err?.response;
    const data = res?.data;
    if (typeof data === "string") return { code: stringToCode(data), message: data, status: res.status };
    if (data?.code) return { code: data.code, message: data.message || data.code, status: res.status };
    if (data?.errors && typeof data.errors === "object") {
      const msgs = Object.values(data.errors).flat().join("; ");
      return { code: data.code || "VALIDATION_ERROR", message: msgs || data.title || "Validation failed", status: res.status };
    }
    if (data?.title) return { code: "PROBLEM_JSON", message: data.title, status: res.status };
    if (data?.message) return { code: stringToCode(data.message), message: data.message, status: res.status };
    if (err?.message === "Network Error") return { code: "NETWORK_ERROR", message: "Không thể kết nối máy chủ", status: 0 };
    if (res?.status === 429) return { code: "RATE_LIMITED", message: "Thao tác quá nhanh, vui lòng thử lại sau", status: 429 };
    return { code: "UNKNOWN_ERROR", message: err?.message || "Đã xảy ra lỗi", status: res?.status || 0 };
  }

  api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (r) => r,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original?._retry && getRefreshToken()) {
        original._retry = true;
        try {
          if (!getRefreshPromise()) {
            const p = (async () => {
              const { data } = await axios.post(`${baseUrl}/api/Auth/refresh`, { refreshToken: getRefreshToken() });
              // backend returns { token, refreshToken, expiresInMinutes, id?, fullName?, email? } — tolerate both shapes
              setTokens({ token: data.token, refreshToken: data.refreshToken, expiresInMinutes: data.expiresInMinutes, id: data.id, fullName: data.fullName, email: data.email });
              return data.token;
            })();
            setRefreshPromise(p);
            p.finally(clearRefreshPromise);
          }
          const newToken = await getRefreshPromise();
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch (e) {
          clearAuth();
          if (window.location.pathname !== "/auth") window.location.href = "/auth";
          return Promise.reject(e);
        }
      }
      if (error.response?.status === 401) {
        clearAuth();
        if (window.location.pathname !== "/auth") window.location.href = "/auth";
      }
      return Promise.reject(error);
    }
  );

  export default api;
  ```

- [ ] **Step 1.2.4: Tests + lint + build**
  Run: `npm run test && npm run lint && npm run build`

- [ ] **Step 1.2.5: Commit**

### Task 1.3: auth API module

**Files:**
- Create: `src/api/auth.js`

- [ ] **Step 1.3.1: Implement**
  ```js
  import api from "./core.js";
  export const signIn = (body) => api.post("/api/Auth/SignIn", body);
  export const signUp = (body) => api.post("/api/Auth/SignUp", body);
  export const forgotPassword = (email) => api.post("/api/Auth/ForgotPassword", { email });
  export const resetPassword = (body) => api.post("/api/Auth/ResetPassword", body);
  export const googleLogin = (idToken) => api.post("/api/Auth/google-login", { idToken });
  export const getProfileStatus = () => api.get("/api/Auth/profile-status");
  export const refreshToken = (refreshToken) => api.post("/api/Auth/refresh", { refreshToken });
  export const logout = () => api.post("/api/Auth/logout");
  export const getAccountById = (id) => api.get(`/api/Account/${id}`);
  export const updateAccount = (id, body) => api.put(`/api/Account/${id}`, body);
  ```

- [ ] **Step 1.3.2: lint/build, Commit**

### Task 1.4: AuthContext rewrite

**Files:**
- Modify: `src/context/AuthContext.jsx`

Key: keep public API identical (`user, login, logout, updateUser, isAuthenticated`) so 9 consumers don't change. Internally delegate to `tokenManager` + `auth.js`. `login` calls `auth.signIn` then `tokenManager.setTokens`. `logout` calls `auth.logout` (best-effort) then `clearAuth`. Add effect to hydrate `user` from `getUser()` on mount. Delete 201-line legacy token/email/user localStorage spaghetti; ensure no references to `localStorage.getItem("token")` remain outside `tokenManager`/`core`.

- [ ] Verify by: `grep -r 'localStorage.*token' src/` → only tokenManager/core.

### Task 1.5: AuthPage — codes, dob, password floor

**Files:**
- Modify: `src/pages/Login/AuthPage.jsx`

Changes: import `extractApiError`; replace string-match branches `if (msg === "Email not found.")` → `if (code === "ACCOUNT_NOT_FOUND")`; DOB input `type="date"` and submit `dob: values.dob` (YYYY-MM-DD); password rule `minLength: 8` with message `Mật khẩu tối thiểu 8 ký tự`; store id/tokens via `login()` path, no direct localStorage writes.

### Task 1.6: ResetPasswordPage + route

**Files:**
- Create: `src/pages/Auth/ResetPasswordPage.jsx`
- Modify: `src/routes/paths.js`, `src/index.jsx`, `.env.example`

Page reads `useSearchParams().get("token")`, form { newPassword, confirmPassword } → `POST /api/Auth/ResetPassword { token, newPassword }`. Add `VITE_GOOGLE_CLIENT_ID=` to `.env.example`. Move hardcoded `googleClientId` in `AuthPage.jsx:192` to `import.meta.env.VITE_GOOGLE_CLIENT_ID`.

### Task 1.7: Google profile-status gate

**Files:**
- Modify: `src/components/GoogleLoginButton.jsx` (path `/api/Auth/google-login`), `AuthPage.jsx` google handler

After `googleLogin` success, call `getProfileStatus()`; if `isComplete === false` → navigate `/profile?onboarding=1`.

### Task 1.8: UserProfile own-id switch + elementId

**Files:**
- Modify: `src/pages/UserProfile/UserProfile.jsx`

Replace `GET api/Account/email/${localStorage.getItem("email")}` with `GET /api/Account/${user.accountId}` (from `useAuth()`). Remove wallet display. Element chip: `elementId ?? map(elementName)` fallback. Re-fetch after save uses own-id.

### Task 1.9: R1 verify gate

Run `npm run test && npm run lint && npm run build` and capture Playwright screenshots for `/auth` and `/profile` (mock unauth redirect). Vision-check: no literal Vietnamese fallback strings showing on wrong state; date input renders; error toast shows code-derived message. Commit R1 as batch or per-subtask (recommend per-subtask pushes already done — final R1 tag).

---

## R2 — Marketplace Removal

### Task 2.1: Delete modules

**Files:**
- Delete: `src/pages/KoiListingPage/**`, `src/pages/DetailPage/**`, `src/pages/DecorationPage/**`, `src/pages/PostListing/**`, `src/pages/Favorites/**`, `src/components/ListingCard.jsx`, `src/context/FavoritesContext.jsx`, `src/utils/shareResult.js`, `src/api/listings.js`

### Task 2.2: Prune consumers

**Files:**
- Modify: `src/index.jsx` (drop 5 routes + FavoritesProvider + 5 lazy imports), `src/routes/paths.js` (drop keys + title map entries for marketplace), `src/components/Header/Header.jsx` (remove favorites/listing nav + dropdown entries), `src/components/Footer/Footer.jsx` (same), `src/pages/Homepage/Homepage.jsx` (remove koi rails that imported ListingCard/listings api → leave hero+compatibility+blog rail placeholders for R3), `src/config/axios.jsx` barrel (drop listing re-exports), `src/api/dashboard.js` (drop `getNewMarketListingsCount`, `getNewMarketListingsByCategory`, `getTotalTransaction`), `src/pages/Dashboard/index.jsx` (drop "Bài đăng mới" card L26/L46-48/L81-88), `src/pages/Dashboard/IncomeAreaChart.jsx` + `src/pages/Dashboard/UniqueVisitorCard.jsx` (remove marketplace chart), `src/layout/*` if referencing

### Task 2.3: Verify R2

```bash
grep -R "MarketplaceListings\|KoiListing\|DetailPage\|DecorationPage\|PostListing\|FavoritesProvider\|ListingCard\|shareResult\|MarketCategory" src --include="*.jsx" --include="*.js" | wc -l  # expect 0 (excluding comments in docs)
npm run lint && npm run build
node C:/Users/Karui/AppData/Local/Temp/opencode/shot/shoot.mjs  # screenshots should 404-gracefully for removed routes (NotFound)
```

Commit: `refactor!: remove marketplace/favorites surfaces per signed agreement (BREAKING: routes deleted)`

---

## R3 — New Surfaces (code-first; backend specs landed as fc78330+1e53d9e)

### Task 3.1: API modules + adapters

**Files:**
- Create: `src/api/community.js`, `src/api/partners.js`, `src/constants/postTypes.js`
- Modify: `src/api/posts.js`, `src/api/dashboard.js`

Community adapter must handle legacy envelope: `const unwrap = (res) => res.data?.data ?? res.data` for `GET /api/Post/Details/{id}` and upload response `{ status, message, data: { imageId, url } }` → return `{ imageId, url }` with fallback `imageId ?? null` if url-only cached. Upload function: `uploadImage(file) => api.post("/api/Post/UploadImage", formData).then(r => r.data?.data ?? r.data)`. Categories: `getCategories() => api.get("/api/Post/categories")`.

### Task 3.2: Community feed `/community`

List Approved-only (server-guaranteed). Query `q=` debounced. Cards use `imageUrls[0]`, title `name`, excerpt. Pagination via API. Empty → `EmptyState` with search hint. File: `src/pages/Community/CommunityPage.jsx`.

### Task 3.3: Community submit `/community/submit` (member, ProtectedRoute)

Fields: title (`name`), description (Quill), images 1-5 (≤5MB, jpg/png). Flow: each file → `uploadImage` → collect `imageIds[]` → `POST /api/Post/Create { name, description, postTypeId: COMMUNITY, imageIds }` → Pending toast "Bài viết đã gửi — Đang chờ duyệt". Defensively read `imageId ?? null`. Show Q11 note: no "my posts" visibility until decision; if rejected by backend later, add it in follow-up.

### Task 3.4: Blog migration to public endpoints

Files: `src/pages/AdminPost/BlogPage.jsx`, `src/pages/BlogDetail/BlogDetail.jsx`

Switch from `getAllPosts`+client `status==="active"` filter to `GET /api/Post/GetAllByPostType/{BLOG}` and `GET /api/Post/Details/{id}` (single-call, unwrap legacy envelope, render `imageUrls`). Delete `getActivePostById` fetch-all pattern.

### Task 3.5: Partners public + admin

Files: `src/pages/Partners/PartnersPage.jsx` (public, GET `/api/partner-shops`), `src/pages/AdminPartners/AdminPartnersPage.jsx` (AdminShell, CRUD per guide shapes), routes `paths.js`.

### Task 3.6: AdminPost + FAQManager shape fixes

Fix latent bug `post.id === POST_CATEGORY_ID` → `post.postTypeId === POST_TYPE_BLOG`. Status chips `Pending`→"Chờ duyệt", `Approved`→"Đã duyệt". Drop `accountId` from `FormData` create paths (both Blog and FAQManager). Read lowercase `imageUrls` exactly. FAQManager: `createFAQ({question, answer})` without accountId.

### Task 3.7: Dashboard + Homepage replacement

Dashboard: new `getContentSummary` stat card + pending badge → `/AdminPost?filter=pending`. Homepage: replace market koi rails with community highlights rail (`getFeed({postTypeId: COMMUNITY, pageSize: 6})`) + partners teaser strip. Search hero → navigate `/community?q=`.

### Task 3.8: Central error/429 + hero polish

Ensure every catch uses `extractApiError` → toast/message. 429 shows retry delay message. No new placeholder pages.

---

## R4 — Cleanup & Release

### Task 4.1: Dead-code sweep

- Remove `src/constants/postTypes.js` if categories endpoint now canonical (feature-flag removal).
- Delete unused `src/config/axios.jsx` barrel entries if still referenced.
- Ensure `src/styles/tokens.css` is the single source for ngũ hành vars; remove duplicate color literals.

### Task 4.2: Docs + version tag

Update `docs/backend-api-contract.md` header (already marked superseded), ensure `docs/agreements-final.md` matches Council hash. `npm run lint && npm run build && npm run test` green, screenshots clean. Tag: `git tag v2.0.0-rc -m "API migration R1-R4 per signed agreement"`.

---

## Verification Plan

Per-wave gate: `npm run lint` (0 errors), `npm run build` (no chunk errors), `npm run test` (vitest suites). Playwright screenshots (`shoot.mjs`) after each wave: `/`, `/auth`, `/blog`, `/blog/:id`, `/community`, `/community/submit` (auth-gated), `/partners`, `/Dashboard`, `/AdminPost`. Backend proxy must point at `https://localhost:7285` with VITE_API_URL empty in dev — 502 before backend up is expected; success is correct EmptyState/NotFound rendering, not data presence. Pre-merge: `npm audit` (known quill low accepted).

## Risks & Mitigations

- Refresh loop: `_retry` flag + no refresh on `/api/Auth/refresh` itself prevents loop.
- localStorage XSS residual accepted (D5) — backed by S5 server sanitization; no refresh token in httpOnly cookie needed for SPA+proxy.
- Upload additive field: defensive `data.imageId ?? data.url` read keeps transition safe.
- Favorites removal is breaking — confirm no deep links in docs/SEO beyond in-app links already pruned.
