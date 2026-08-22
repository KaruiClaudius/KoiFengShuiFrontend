# Hóa Long Design Spec — Phase 2 Public Rebuild

Single source of truth for rebuilding public pages. Read this BEFORE editing any page.

## Brand
“Hóa Long 化龍” — the carp ascending the Dragon Gate. Serene Vietnamese lacquer craft × Sino-Vietnamese feng shui. Rice paper surfaces, ink text, cinnabar actions, gold hairlines, jade success, pond-indigo storytelling bands. Premium calm — never neon, never generic SaaS.

## Tokens (CSS vars mapped into Tailwind)
- Colors: `paper #F8F4EA` · `paper-2 #F1EAD9` · `surface #FFFDF6` · `ink #211B16` · `ink-soft #4A4038` · `muted #8A7F70` · `crimson #A92C2C` (+ `crimson-deep`) · `gold #C9A227` (+ `gold-soft`) · `jade #2F6E5D` · `pond #10233D`
- Ngũ hành: `kim B8B08D` · `moc 4E7C4A` · `thuy 1F3A5F` · `hoa B23A2E` · `tho A98142`
- Fonts: `font-display` (Playfair Display) for h1/h2/h3 & numerals; `font-body` (Be Vietnam Pro) everything else. Body 15–16px, lh relaxed.
- Radii `rounded-sm|md|lg` (8/12/16). Shadows `shadow-plaque`, `shadow-lift`, focus ring `shadow-gold`.
- Motion: `duration-fast/base/slow` + `ease-water`; animations `animate-fade-rise`, `animate-seal-in`. Respect reduced-motion (tokens auto-zero).
- Utilities: `.grain-bg` (rice paper grain), `.hairline-top`.

## UI kit (`src/ui` — import from `"../ui"` or `"../../ui"`)
- `<Button variant="primary|secondary|ghost|gold" size="sm|md|lg">` — primary = cinnabar.
- `<Card interactive?>` — jade-plaque surface w/ gold hairline.
- `<Badge element="kim|moc|thuy|hoa|tho">Mộc — Tên</Badge>` — ngũ-hành chip w/ dot. Plain `<Badge>` = rotated crimson seal chip (use sparingly: “Nổi bật”).
- `<Input label error hint name>` — inkstone input w/ gold focus ring.
- `Skeleton` / `PageLoader` — ink-wash shimmer; NEVER plain “Loading…” text.
- `<EmptyState title description action>` — DragonGate motif empty state.
- `Dialog/DialogContent(title, description, side)` — Radix; silk side-panel (`side="right"`) for forms.
- `Tabs/TabsList/Tab/TabsContent` — ink-brush underline tabs.
- `notify.success/error/info(msg)` from Toast — replaces ALL antd `message.*`.

## Motifs (`src/assets/motifs/Motifs.jsx`)
`SealStamp` (brand mark) · `WaveBand` (seigaiha band; put on pond bg) · `CloudDivider` (section break) · `KoiSilhouette` (decor) · `DragonGate` (empty/success) · `ElementDot` · `LotusMark`. All `currentColor`; decorative ones get `aria-hidden`.

## Page anatomy rules
1. **One `<h1>` per page** (font-display, clamp ~text-3xl→5xl). Card titles are `<h3>`.
2. Hero = pond-indigo band (`bg-pond text-[#FDF6EC]`) + `WaveBand` overlay bottom + display headline + primary CTA. NOT full-bleed photo walls (banner1.jpg stays only where already used; do not add new heavy images).
3. Sections: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, vertical rhythm `py-14 md:py-20`; separate major sections with `CloudDivider`.
4. Listing cards: `Card interactive` + aspect-[4/3] image wrapper (img `loading="lazy"` + object-cover) + element Badge + title (h3, truncate) + owner row. **NO prices anywhere** — listings are showcase-only.
5. Loading = Skeleton grids matching layout; empty/zero-results = EmptyState; errors = inline `EmptyState` w/ retry Button (never raw `{error}` text).
6. Responsive: mobile-first. Grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5`. Filters become collapsible panel `<details>` on mobile.
7. Accessibility: icon-only controls need `aria-label`; carousels/arrows = real `<button aria-label="…">`; nav links real links; contrast ≥ 4.5:1 (no amber-on-white).
8. Language: user-facing copy in Vietnamese, warm & serene (e.g., “Tìm chú cá của bạn”, “Bản mệnh”, “Xem thêm”). No English UI labels.
9. Images: always `loading="lazy"` except hero; wrap with fixed aspect container to avoid CLS.
10. Do NOT import antd/MUI/Joy in rebuilt files. Use ui kit + Tailwind + motifs only. Native `<details>/<summary>` allowed for accordions/filters.
11. Pages must NOT render AppHeader/Footer themselves anymore (the route shell provides them). Remove those imports/mounts.
12. Keep data-fetching logic/endpoints identical unless specified; you may restructure effects (deps arrays correct, cleanup flags).

## Copy glossary (use consistently)
Trang chủ · Cá Koi · Đồ trang trí hồ cá · Tư vấn bản mệnh · Kinh nghiệm hay · Bản mệnh · Xem thêm · Đang tải… · Không tìm thấy kết quả phù hợp
