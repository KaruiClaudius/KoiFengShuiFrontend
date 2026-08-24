# Koi FengShui — Backend API Contract & Feature Requests

> ⚠️ **SUPERSEDED** — migration executed 2026-08-23 per `docs/agreements-final.md`
> (Council hash `98e32473f06b`). Frontend now runs entirely on the rebuilt backend:
> refresh-token auth, community feed (`/community`), partner shops (`/partners`),
> public Approved-only post surfaces. This file remains as the historical request list.
> **Source of truth:** what the frontend actually calls today (`KoiFengShuiFrontend/src/api/*.js`), plus new features shipped in the redesign and contracts we need enforced.
> Dev proxy: `/api` → `https://localhost:7285` (see `vite.config.js`). Auth: `Authorization: Bearer <JWT>` on every request; frontend clears session and redirects to `/auth` on any `401`.

---

## 1. Conventions

### Response envelope — please standardize
The frontend tolerates two shapes today, which is fragile. For the rebuild:

```jsonc
// Lists
{ "data": [ ... ], "totalItems": 123, "page": 1, "pageSize": 10 }
// Single item
{ "data": { ... } }
// Errors (with correct HTTP status)
{ "message": "human readable", "errors": { "field": ["issue"] } }
```

Field names below are read **exactly** as written — coordinate before renaming.

---

## 2. Endpoints consumed today

### 2.1 Auth
| Method | Path | Body | Response fields used |
|---|---|---|---|
| POST | `/api/Auth/SignIn` | `{ email, password }` | `{ token, email }` |
| POST | `/api/Auth/SignUp` | `{ fullName, email, password, doB, phone, gender }` | — |
| POST | `/api/Auth/ForgotPassword` | `{ email }` | message |
| POST | `/api/auth/google-login` | `{ accessToken }` | `{ token, email }` |

- Sign-in failures matched literally: `"Email not found."`, `"Incorrect password."` — keep strings or send us codes.
- Password min length client-side = **6** — align server validation.

### 2.2 Account
| Method | Path | Notes |
|---|---|---|
| GET | `/api/Account/email/{email}` | Profile: `accountId, fullName, dob (ISO), gender ("male"/"female"/"other"), phone, email, elementId, roleId, wallet` |
| PUT | `/api/Account/{accountId}` | `{ email, fullName, dob: "YYYY-MM-DD", gender, phone }` |
| PUT | `/api/Account/{accountId}/change-password` | `{ currentPassword, newPassword }` |

### 2.3 Marketplace Listings (showcase mode — no commerce)
| Method | Path | Query |
|---|---|---|
| GET | `/api/MarketplaceListings/GetAllByCategoryType/{categoryId}` | `page, pageSize` → list + `totalItems` |
| GET | `/api/MarketplaceListings/GetAllByElementId/{elementId}/Category/{categoryId}` | `excludeListingId, page, pageSize` |
| GET | `/api/MarketplaceListings/GetAllByAccount/{accountId}/Category/{categoryId}` | `excludeListingId, page, pageSize` |
| GET | `/api/MarketplaceListings/Details/{id}` | returns array; FE uses `[0]` |
| POST | `/api/MarketplaceListings/Create` | multipart, see below |

Fields rendered by UI: `listingId, title, description (rich HTML), quantity, color, elementId, elementName ("Non element" sentinel), categoryId, categoryid* (§6), accountName, accountPhoneNumber, listingImages[].image.imageUrl, tierName, price (in model, NOT displayed)`.

Create FormData (current): `AccountId, TierId (=1 hardcoded), Title, Description, Price, Color (joined string, §6), Quantity, CategoryId, CreateAt, ExpiresAt (+30d), IsActive (true), Status ("Approved"), ElementId, images[] (max 5)`.
⚠️ `Status: "Approved"` sent by client today — must become server-decided (§5).

### 2.4 Posts / Blog
| Method | Path | Notes |
|---|---|---|
| GET | `/api/AdminPost/GetAllPosts` | FE filters `status === "active"` client-side; fields: `postId (fallback id), name, description (HTML), imageUrls[], status ("active"), createAt` |
| POST | `/api/AdminPost/CreatePostWithImages` | multipart: `name, description, status, accountId, id (=3), elementId (=6), images[]` — legacy magic numbers, please normalize |
| PUT | `/api/AdminPost/UpdatePost/{postId}` | same shape |
| DELETE | `/api/AdminPost/DeletePostWithAllRelated/{postId}` | — |

### 2.5 FAQ
| Method | Path | Payload |
|---|---|---|
| GET | `/api/FAQ/GetAll` | — |
| POST | `/api/FAQ/Create` | `{ question, answer, accountId }` |
| PUT | `/api/FAQ/Update/{faqId}` | full FAQ object spread |
| DELETE | `/api/FAQ/Delete/{faqId}` | — |

### 2.6 Dashboard (admin)
| Method | Path | Used by |
|---|---|---|
| GET | `/api/Dashboard/new-users-count?days=30` | stat card |
| GET | `/api/Dashboard/new-users-list?days=30` | list (`accountId, fullName, createAt`) |
| GET | `/api/Dashboard/traffic-distribution` | bar chart |
| GET | `/api/dashboard/new-market-listings-count?days=30` | stat card (`{ count }`) |
| GET | `/api/dashboard/new-market-listings-by-category?days=30` | area chart |

Note the mixed path casing (`Dashboard` vs `dashboard`) — pick one during rebuild.

### 2.7 Master data & consultation
| Method | Path | Used by |
|---|---|---|
| GET | `/api/Element/GetAll` | filters/forms (`elementId, elementName`) |
| GET | `/api/MarketCategory/GetAll` | filters/breadcrumbs (`categoryid, categoryName` — note lowercase field) |
| POST | `/api/Compatibility/lookup` | compatibility form |
| POST | `/api/Consultation/fengshui` | feng shui consultation |

---

## 3. NEW features the frontend just shipped (need backend support)

### 3.1 Search (shipped client-side — needs a real endpoint)
Today: hero search navigates to `/KoiListings?q=<term>` and we filter **only the current page's** items by title, client-side. This misses matches on other pages.

**Request:** extend listing queries with a `q` parameter:
```
GET /api/MarketplaceListings/GetAllByCategoryType/{categoryId}?q=kohaku&page=1&pageSize=12
```
- Match on `title` (and ideally `description`), case- and Vietnamese-diacritic-insensitive.
- Optional: a dedicated `GET /api/MarketplaceListings/search?q=&categoryId=&elementId=&page=&pageSize=` so homepage search can span all categories.

### 3.2 Favorites (currently localStorage-only)
The frontend stores snapshot objects locally (`listingId, title, image, elementName, accountName`, max 50). For cross-device persistence:
```
GET    /api/Account/{accountId}/favorites            -> ListingSummary[]
POST   /api/Account/{accountId}/favorites/{listingId}
DELETE /api/Account/{accountId}/favorites/{listingId}
```
`ListingSummary`: `{ listingId, title, coverImageUrl, elementName, accountName }`. The frontend will switch to these once available.

### 3.3 Blog detail page (shipped — inefficient today)
`/blog/:id` exists, but there is no single-post endpoint, so the frontend fetches **all** posts and finds one client-side.
**Request:** `GET /api/AdminPost/GetPostById/{postId}` (or public `GET /api/Posts/{id}` returning only `status === "active"` posts for non-admins).

### 3.4 Consultation result sharing (shipped — frontend-only canvas)
No backend needed; listed for visibility. If you later want shareable links instead of images: `POST /api/Consultation` → `{ id }` + `GET /api/Consultation/{id}`.

---

## 4. Security requirements for the rebuild (from our audit)

| # | Requirement | Why |
|---|---|---|
| S1 | **Server-side RBAC.** Issue `roleId` inside the signed JWT; authorize admin endpoints (`AdminPost/*`, `FAQ/Create|Update|Delete`, Dashboard) server-side. Frontend checks are UX only and spoofable via DevTools. | Audit M3 |
| S2 | **Listing approval state machine.** New listings must enter `Pending`; only admins move them to `Approved`. Ignore/override any client-sent `Status`. | Audit C2 |
| S3 | **Never trust client amounts/wallet mutations.** The old `UpdateWalletAfterPosted?amount=` pattern must not return in any form. Payment surfaces were removed from the frontend entirely. | Audit C1 |
| S4 | Short-lived JWT + refresh token (httpOnly cookie preferred); do NOT require the frontend to store long-lived tokens. We will migrate storage accordingly. | Audit M2 |
| S5 | Sanitize rich-text HTML server-side too (allow-list tags). The frontend sanitizes on render with DOMPurify, but defense in depth. | Audit H1 |
| S6 | CORS allow-list: production frontend origin(s) only; never `*` with credentials. Local dev uses the Vite proxy, so no CORS config needed for localhost. | — |
| S7 | Return structured errors + correct status codes (400 validation, 401 unauthenticated, 403 forbidden, 409 conflicts). Never leak stack traces. | — |

---

## 5. Data inconsistencies to resolve during rebuild

1. **Color values mismatch (user-visible bug risk).** Create form submits Vietnamese colors joined (`"Trắng, Đỏ, Đen, Vàng, Xám bạc"`), while listing filters match English substrings (`White/Red/Black/Yellow/Silver`). Recommend: store an enum/code set (`white, red, black, yellow, silver, orange, blue, gray, purple, green`) + localize at display. We will adapt both forms/filters once agreed.
2. **Path casing:** `/api/Dashboard/...` vs `/api/dashboard/...` — standardize.
3. **Field casing:** `categoryid` vs `categoryId` — standardize.
4. **Element sentinel:** `"Non element"` string is used as a sentinel value — prefer `null`.
5. **Tier names as data:** featured badges check `tierName === "Tin Nổi Bật"` (and legacy `"Preminum"` typo). Prefer a boolean `isFeatured` / tier code.
6. **Post ids:** responses sometimes carry `postId`, sometimes `id` — pick one.
7. **Create payload magic numbers:** post create sends `id = 3`, `elementId = 6`; listing create hardcodes `TierId = 1` and computes `ExpiresAt = now+30d`. Replace with server-side defaults/policies.

## 6. Deprecation candidates (frontend no longer calls these)

- All PayOS/payment endpoints, wallet top-up & mutation endpoints
- Subscription-tier purchase flow (`/api/SubcriptionTiers/GetAll` still referenced nowhere after cleanup)
- Transaction dashboards (`transactions-listing`, `total-amount`, `transactions/count`)
- Client-side wallet display fields

Keep whatever the new business design needs — but know the frontend will not ship commerce UI.

---

## 7. Environment

| Var | Where | Value |
|---|---|---|
| `VITE_API_URL` | frontend `.env` | empty in dev (proxy handles it); absolute origin in prod, e.g. `https://api.koifengshui.vn` |
| CORS | backend | allow production frontend origin; local dev needs nothing (proxied) |

Contact: frontend team via this repo.

