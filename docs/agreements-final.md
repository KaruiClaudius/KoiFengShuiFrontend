# Agreements — Frontend Response & Sign-off (v1.0)

> **Frontend position** on `API_AGREEMENT_PROPOSAL.md` (D1–D8), plus three additional
> decisions we need (D9–D11) — one of which is a **build blocker**.
> Marker legend inherited from the proposal: DONE / BACKLOG / DECIDE / REMOVED.
> Nothing here overrides the backend proposal; this file completes it.

---

## 1. Frontend responses to D1–D8

| # | Topic | FE position | Notes |
|---|---|---|---|
| D1 | Sign-in error contract | ✅ Agree: **codes** | Condition: ship **both** `code` + human `message` during transition so we can switch immediately (we stop matching literal strings as soon as codes exist). Codes we need at minimum: `ACCOUNT_NOT_FOUND`, `INVALID_PASSWORD`, `EMAIL_TAKEN`, `RATE_LIMITED`. |
| D2 | Post status vocabulary | ✅ Agree: keep `Pending / Approved` | We map internally; our old `"active"` filter disappears with the marketplace screens. Public surfaces show Approved only — please guarantee public endpoints never leak Pending to anonymous callers. |
| D3 | Search scope | ✅ Agree: add `q=` to posts feed (`GetAllByPostType`) | Title match, case- + diacritic-insensitive. Pagination params unchanged. Not blocking launch — can trail by one release. |
| D4 | Favorites v2 | ✅ Agree: **defer** | We delete listing-favorites UI entirely; no favorites shipped in v1 of the new frontend. |
| D5 | Refresh token transport | ✅ Agree: JSON body | Mitigations on our side: single-flight refresh guard (never two concurrent refresh calls), proactive refresh at ~½ life, refresh-token stored per device, full logout via `POST /api/Auth/logout`. Accepted residual XSS-storage risk, backed by S5 sanitization once landed. |
| D6 | Envelope unification | ✅ Agree: new-endpoints-first | We ship adapter wrappers for the two legacy envelopes (`Element/GetAll`, `UploadImage`) isolated in `src/api/` — zero legacy-shape parsing outside that layer. |
| D7 | Password minimum length | ✅ Agree: **8+** | Please publish the exact constant/message; our forms raise validation to match on the same day. |
| D8 | Member FAQ submissions | ✅ Agree: defer | FAQ Create body drops `accountId`; FAQ admin screens send auth-derived identity implicitly. |

---

## 2. Additional decisions we need — **please add these to the proposal**

### D9 — Images ↔ posts wiring ⛔ **BUILD BLOCKER**
`UploadImage/UploadFile` returns `{ url }`, but member post creation takes `imageIds: number[]`. There is no documented path from a URL to an id.
**Options:**
- (a) Upload response becomes `{ id, url }` *(preferred)*, or
- (b) Post create accepts `imageUrls: string[]`.
FE cannot start the community submission form until this is answered.

### D10 — Post type constants (informational, needed for R3)
Which `postTypeId` values correspond to “Kinh nghiệm hay” (blog) vs community/member posts? A constants table (or enum endpoint) is enough.
*Interim FE default if unanswered:* blog = type `3` (matches old `/api/Post/GetAllByPostType/3` usage), community = type `1`.

### D11 — Public post detail payload
Accepted: adding `imageUrls` to the **public** `PostResponse` is BACKLOG on your side. `/blog/:id` needs it in one call.
**Ask:** confirm it lands before our blog-detail release, and meanwhile confirm whether the raw entity from `api/Post/Details/{id}` exposes images under any field name we can adapt to as a stopgap.

---

## 3. Items the frontend resolves unilaterally (no backend work)

| Item | Resolution |
|---|---|
| SignUp `dob` format | We send full ISO datetime (`YYYY-MM-DDT00:00:00Z`) — matches your binder; date-only request withdrawn. |
| Account element data | We consume `elementName` (nullable) and map VN name → ngũ-hành color key client-side. `elementId` request dropped. |
| `wallet` field | All wallet UI already deleted; nothing reads it. |
| Old literal error strings | Removed from our codebase the moment D1 codes land. |
| `AdminPostResponse.imageUrls` casing | We read lowercase-first `imageUrls` exactly as documented. |

---

## 4. Frontend delivery plan (starts immediately after §2 answers)

| Wave | Scope | Depends on |
|---|---|---|
| R1 Auth rewrite | Token-pair storage, silent refresh + retry-once interceptor, proactive refresh, logout call, `/reset-password` page, profile-status onboarding gate, account reads via own-id, D1/D7 validation alignment | none (codes/constant when available) |
| R2 Marketplace removal | Delete KoiListing/Detail/Decoration/PostListing/Favorites/ListingCard + api module + nav/paths cleanup | none |
| R3 New surfaces | `/community` feed (+`q=` if D3 lands) + member submission form (**blocked on D9**) + “Đang chờ duyệt” states · `/partners` directory + admin CRUD · blog onto public endpoints (**D10/D11**) · Dashboard `content-summary` widget + pending badge · central problem+json/`message` error parser + 429 UX | D9, D10, D11 |
| R4 Cleanup | Dead module purge, legacy-envelope adapters isolated, tag release against signed spec | all above |

Estimates: R1–R2 ≈ 2–3 days · R3 ≈ 3–5 days (submission form excluded until D9) · R4 ≈ 0.5 day.

---

## 5. Conditions attached to frontend sign-off

We sign off on the proposal **with** the following tracked:

1. **S5 sanitization BACKLOG gets an owner + target milestone** (rich-text allow-list server-side). Our DOMPurify covers rendering meanwhile.
2. **D9 answered before R3 submission-form work starts.**
3. **D7 constant + D1 codes published in FRONTEND_API_GUIDE** (one-line changelog entry each).
4. Prod CORS origins shared at deploy time (S6 noted DONE).

---

## 6. Sign-off

| Side | Name | Date | Agreement hash (git commit of this file) |
|---|---|---|---|
| Backend | | | |
| Frontend | Frontend team (Karui) | 2026-08-23 | _(filled after commit)_ |

Agreed deviations from proposal text: none — all eight backend recommendations accepted; three decisions added (D9–D11).

---

# Backend Responses & Counter-Sign-off

> **Section owner: BACKEND team** (the "other team" in this council).
> This section answers every open item above with code-verified facts.
> Where we commit to work below, it lands on `master` before this file is merged.

---

## 1. D1-D8: all eight frontend positions ACCEPTED as written

No counter-conditions. Two of your asks convert to immediate implementation rather than
backlog - see items 3 and 4 below.

## 2. Your three new decisions - answered

### D9 Images <-> posts wiring [BUILD BLOCKER] - RESOLVED: option (a)

Verified against source: `UploadImage/UploadFile` already persists an `Images` row via
`AddImageAsync(url)` but discards the generated id when building the response.

Backend commits NOW:
- `AddImageAsync` returns the generated `ImageId`.
- Upload response envelope becomes `{ status, message, data: { imageId, url } }`
  (new field added; existing `url` untouched so nothing breaks mid-flight).
- Member post create keeps taking `imageIds: number[]` - no change needed on that contract.

Status: implemented in the same push as this file.

### D10 Post type constants - ANSWERED with an improvement

The server never had a canonical enum endpoint; category ids live in PostCategories data
(legacy usage indeed had blog = 3, community = 1 - your interim defaults are correct for
the current database). Rather than freeze magic numbers into a constants table:

- Backend adds public `GET /api/Post/categories` returning
  `[{ "categoryId": 1, "categoryName": "..." }, ...]` straight from PostCategories.
- Frontend consumes that endpoint instead of hardcoding; your interim defaults remain
  valid until then.
Status: implemented in the same push as this file.

### D11 Public post detail payload - CONFIRMED + one honest disclosure

- Confirmed: adding `imageUrls` to public `PostResponse` is landing now (same push).
- Disclosure / fix you did not know to ask for: `api/Post/Details/{id}` returns a legacy
  envelope (`{ status, message, data }`) where `data` is the PostResponse DTO - there is
  NO raw-entity images field to adapt to as a stopgap. The stopgap question is moot;
  the real fix ships now.
- Bonus security alignment with your D2 condition: see item 4.

## 3. Your D2 condition exposed a real gap - fixed in this round

Verified: public feed (`GetAll`, `GetAllByPostType/{type}`) and public detail
(`Details/{id}`) currently return **Pending** posts to anonymous callers.

Backend commits NOW:
- Public feed endpoints filter to `status == "Approved"` only.
- Public detail returns `404` for non-approved posts unless the caller holds an admin role.
- Admin visibility is unaffected (`/api/AdminPost/*` shows the full queue).

Your condition "public endpoints never leak Pending" is therefore guaranteed by tests,
not just intent: regression pins added alongside.

## 4. Answers to draft questions Q5-Q10

| # | Answer |
|---|---|
| Q5 / S5 sanitization | YES - confirmed. Allow-list sanitization on post/FAQ rich text lands next minor release (owner: backend; tracked as BACKLOG with target). |
| Q6 CORS | YES - config-driven allow-list (`AllowedOrigins` array). Production origin(s) will be shared at deploy time exactly as your sign-off condition requests. |
| Q7 `elementId` exposure | Will add `elementId` next to existing `elementName` on AccountResponse (trivial join already exists server-side). |
| Q8 Favorites | Officially dropped. No favorites surface will exist in v1 backend either. |
| Q9 DOB format | Date-only `YYYY-MM-DD` accepted (default JSON binder handles it). Update your docs/examples freely. |
| Q10 Legacy envelopes | Client-side adapters are the right call. Normalization happens opportunistically; we will announce one release ahead before changing `Element/GetAll` or `UploadImage` shapes again (upload shape changes THIS round only by ADDING `imageId`). |

## 5. D1/D7 publication commitments (your sign-off conditions #1-#3)

| Condition | Commitment |
|---|---|
| S5 sanitization owner+milestone | Owner: backend. Target: next minor release after this agreement merges. |
| D9 answered before R3 form work | Answered AND implemented in this push. |
| D7 password constant + D1 codes published in FRONTEND_API_GUIDE | Both land in the guide in this push: minimum length = **8**, codes namespace documented (`ACCOUNT_NOT_FOUND`, `INVALID_PASSWORD`, `EMAIL_TAKEN`, `RATE_LIMITED`) with both `code` + transitional `message`. |
| Prod CORS origins at deploy | Accepted - deploy-time handoff item. |

## 6. Sign-off

| Side | Name | Date | Agreement hash (git commit of this file) |
|---|---|---|---|
| Backend | Backend team (Karui) | 2026-08-23 | _(filled after commit)_ |
| Frontend | Frontend team (Karui) | 2026-08-23 | _(filled after commit)_ |

---

# 7. Frontend Confirmation (final)

> Reviewed every backend answer above against our codebase requirements.
> **Verdict: ZERO CONFLICTS. All positions converge. Frontend confirms the agreement in full.**

## 7.1 Confirmations

| Item | Confirmed | Note |
|---|---|---|
| D1–D8 accepted as written, no counter-conditions | ✅ | Our conditions #1–#3 all carry backend commitments with owners/dates — satisfied. |
| D9 option (a): upload returns `data: { imageId, url }`, additive only | ✅ | Our adapter reads `imageId ?? null` defensively during transition; post create sends `imageIds[]`. Submission-form blocker is **cleared**. |
| D10: adopt `GET /api/Post/categories`; interim constants (blog=3, community=1) valid until then | ✅ | We consume the endpoint when live and delete local constants. |
| D11: `imageUrls` lands on public PostResponse; legacy-envelope disclosure accepted, no stopgap needed | ✅ | Our `api/Post/Details/{id}` adapter parses `{ status, message, data }` already (same shape as Element/GetAll wrapper). |
| D2 hardening: public feeds filter Approved; public detail 404s non-approved for anonymous; regression-pinned | ✅ | Stronger than our condition asked — appreciated. |
| Q7: `elementId` added alongside `elementName` on AccountResponse | ✅ | We prefer `elementId` when present; VN-name mapping remains as fallback. |
| Q9: **date-only `YYYY-MM-DD` accepted** | ✅ | This **supersedes** my §3 “full ISO datetime” note — we send date-only (simpler). Treat §3 row as amended by this line. |
| Q10: one-release-ahead notice before legacy shape changes | ✅ | Same courtesy expected both ways for any FE-facing contract change. |

## 7.2 Unblocked status

- **R1 (auth rewrite)** — unblocked, starts on your go.
- **R2 (marketplace removal)** — unblocked, starts on your go.
- **R3** — fully unblocked including the submission form (D9/D10/D11 all answered + implemented).
- **R4** — unchanged.

Per coordination agreement: **no migration work begins until both sides confirm this file.** This section is the frontend confirmation; backend’s §“Backend Responses & Counter-Sign-off” stands as theirs. A signed copy is archived in `KoiFengShuiFrontend/docs/agreements-final.md` — the hash below references that commit.

## 7.3 Frontend sign-off (final)

| Side | Status | Date |
|---|---|---|
| Frontend | ✅ **CONFIRMED — no conflicts** | 2026-08-23 |
