# API Agreement Draft v0.1 — FRONTEND ↔ BACKEND

> Response to `FRONTEND_API_GUIDE.md` (backend `master`, .NET 10, 2026-08-23), reconciled against our earlier `docs/backend-api-contract.md`.
> **Goal:** one agreed contract. Backend answers the numbered questions in §4 (each has a proposed default — a simple “đồng ý” / alternative per item is enough), then frontend starts migration (§3).

---

## 1. Accepted as-is ✅

We adopt these backend changes without objection:

| Change | Frontend action |
|---|---|
| Refresh-token flow (15 min access, 30-day refresh, rotation, family revocation) | Rewrite auth storage + axios interceptor: silent refresh, retry-once, proactive refresh around half-life |
| `SignIn` response `{ id, fullName, email, token, refreshToken, expiresInMinutes }` | AuthContext stores `id` + tokens; no more email-keyed lookups |
| Passwordless Google login + `profile-status` onboarding gate | After Google login → check gate → route to profile completion |
| Token-based reset (`/reset-password?token=`) | New public page |
| **Marketplace/wallet/tiers/transactions removed** | Delete KoiListing/Detail/Decoration/PostListing/Favorites screens + ListingCard + related API module (§3-R2) |
| Partner Shops directory | New public `/partners` page + admin CRUD screen |
| Member posts enter `Pending` queue; server ignores client status/author fields | Submission form shows “Đang chờ duyệt”; feed shows approved only |
| `GetPostById/{id}` (admin) | Adopted — but see Q2 for the public-page gap |
| `content-summary` dashboard widget | New admin widget + pending-count badge |
| RFC 7807 problem details, 429 rate limits, role claims `1=admin/2=member` | Central error parser + 429-aware UX |

---

## 2. Our original requests — status

| Original ask (contract v1 §3) | Status | Resolution |
|---|---|---|
| 3.1 Search `q` param on listings | ❌ Obsolete (marketplace removed) | Re-request narrowly for **posts feed** (see Q4) |
| 3.2 Favorites endpoints | ⏸ Deferred | Target entity removed. Recommend dropping unless “favorite posts/shops” is desired later |
| 3.3 Single-post fetch | ✅ Granted (admin) | Public pages need the **existing public** `api/Post/Details/{id}` — shape confirmation in Q2 |
| 3.4 Consultation sharing | ✅ No backend needed | Canvas image shipped |
| S1 RBAC | ✅ Delivered (class-level roles) | — |
| S2 Approval state machine | ✅ Delivered (Pending queue) | — |
| S3 No client wallet mutations | ✅ Moot (removed) | — |
| S4 Short-lived tokens + refresh | ✅ Delivered | We migrate storage; no long-lived JWT in localStorage afterwards |
| S5 Server-side HTML sanitization | ❓ Unmentioned | **Please confirm** (Q5) |
| S6 CORS allow-list prod-only | ❓ Unconfirmed | **Please confirm** (Q6) |
| S7 Structured errors | ◐ Partial | Mixed legacy shapes remain; we’ll build a tolerant parser (problem+json → `message` → string) |

---

## 3. Frontend migration plan (starts right after §4 is answered)

**R1 — Auth rewrite**
- Token pair in memory + localStorage; refresh-once interceptor; proactive refresh; `logout` calls `POST /api/Auth/logout`.
- `SignIn`/Google store `id`; **all account reads switch** from `email/{email}` (now admin-only 🔒) to `GET /api/Account/{ownId}`.
- New `/reset-password` page; 429 toast (“Quá nhiều lần thử, vui lòng chờ”).
- Onboarding gate → profile completion (uses existing profile form).

**R2 — Marketplace removal**
- Delete routes/pages/components: KoiListing, Detail, Decoration, PostListing(+Preview), Favorites, ListingCard, search-on-listings; prune `api/listings.js`, favorites context, nav entries, paths.
- Header nav becomes: Trang chủ · Cộng đồng · Đối tác · Tư vấn bản mệnh · Kinh nghiệm hay.

**R3 — New surfaces**
- `/community`: paginated feed via `api/Post/GetAllByPostType/{postTypeId}` (cards from kit), member submission form (title/content/category/images) with “Đang chờ duyệt” state, detail view via `api/Post/Details/{id}`.
- `/partners` public directory + admin CRUD (`/AdminPartners`).
- Blog: migrate public blog off `AdminPost/*` (👑) onto the public post feed/detail endpoints.
- Dashboard: swap market widgets for `content-summary` (+pending badge); drop income chart (source removed).
- Central `parseApiError()` helper (problem+json / `{message}` / string) feeding toasts.

**R4 — Cleanup:** delete dead modules, legacy envelopes isolated to Element/Upload adapters only.

---

## 4. Questions / blockers — please answer each (defaults proposed)

| # | Question | Proposed default if you have no preference |
|---|---|---|
| Q1 | **Images ↔ posts wiring.** `UploadImage/UploadFile` returns `{url}`, but member post create takes `imageIds:number[]`. How do we obtain ids? | Make Upload return `{ id, url }` **or** accept `imageUrls:string[]` in post create |
| Q2 | **Public single post.** Is `api/Post/Details/{id}` usable anonymously for an **Approved** post (and 404 for Pending)? Does its payload include `imageUrls`? | Confirm yes/yes; else add `GET /api/Post/{id}` public DTO |
| Q3 | **Post types.** Which `postTypeId` is the blog (“Kinh nghiệm hay”)? Is there an enum/list endpoint? | Provide constants: e.g. 1=Cộng đồng, 3=Blog |
| Q4 | Feed search: add `q` (title contains, diacritic-insensitive) to `GetAllByPostType`? | Nice-to-have; skip if costly |
| Q5 | Server-side HTML sanitization of `description`/`content` allow-list? | Confirm yes |
| Q6 | CORS: production frontend origin allow-listed, credentials-safe? | Confirm yes; send us the configured origin to verify |
| Q7 | `AccountResponse.elementName` — will you also expose `elementId`? | Either fine; we can map VN name → color key |
| Q8 | Favorites — officially dropped? | Drop |
| Q9 | `SignUp.dob` format: your example is ISO datetime; our form has date-only. Accept `YYYY-MM-DD`? | Accept date-only |
| Q10 | Legacy envelopes on `Element/GetAll` & `UploadImage`: timeline to normalize? | We wrap them client-side; normalize whenever convenient |

---

## 5. Contract deltas we’d like (small)

1. `GET /api/FAQ/Details/{faqId}` noted — good; keep.
2. `AdminPostResponse.imageUrls` casing — please keep exactly `imageUrls` (lowercase first letter) everywhere.
3. `PostResponse.id` (= categoryId, legacy) — rename to `categoryId` when convenient; until then our mapper treats `id` as category, `postId` as identity. **Do not introduce other meanings for `id`.**
4. Traffic distribution percentages + `totalVisitors` — confirmed consumed as documented.

— Frontend team. Once §4 answers land, we execute R1→R4 and tag a release against the agreed spec.
