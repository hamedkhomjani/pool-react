# AquaPro — UX & Architecture Strategy

> **Goal:** Perfect the UX while building a scalable foundation for a future Amazon-like
> e-commerce platform. Today the site sells swimming-pool products; tomorrow it must support
> hundreds of categories, thousands of products, vendors, accounts, and marketplaces — without
> a rewrite.

This document is the single source of truth for *what stays*, *what improves now*, and *how the
architecture grows*. It is intentionally pragmatic: we build only what today's customers need, but
we never take a shortcut that blocks tomorrow's scale.

---

## 1. What stays unchanged

These are deliberately protected. They are the visual identity and the parts of the foundation that
are already correct.

- **Visual identity & color palette.** Keep the existing style. UX changes must not force a redesign.
- **Bilingual EN/FA with lazy-loaded locale chunks.** Already correct and scalable.
- **The catalog data model split** (`products.base.js` structural facts + `content/<lang>.js`
  localized copy). This is the correct foundation — `currency`, `brandId`, `vendorId`, `images`,
  `inStock` are already reserved fields. Keep it.
- **SSR/prerender + per-page SEO.** Already correct — keep.
- **Cart state in `CartContext`** (localStorage-persisted, prices resolved at render).

---

## 2. What UX problems exist today

Findings from a review of the current code and flows.

| Area | Problem | Evidence |
|------|---------|----------|
| **Checkout** | The only order path is "open WhatsApp". No shipping/contact form, no payment step, no confirmation. The purchase loop is not closed. | `CartDrawer.jsx` → single `checkout()` → `window.open(whatsappUrl)`. |
| **Add to cart** | Listing cards link to a modal/detail page but offer **no direct add-to-cart** from the grid. "Easy to add" is not met from listings. | `CategoryPage.jsx` grid buttons only open detail. |
| **Comparison** | The brief lists "easy to compare products" as a goal, but there is **no compare feature**. | No compare component/data exists. |
| **Navigation depth** | The category tree supports subcategories, but **all 7 categories are top-level** with no children. The mega-menu and IA do not really handle depth yet. | `categories.js` — every node has `parentId: null`. |
| **Wayfinding** | No breadcrumbs anywhere. Once subcategories + catalogs exist users will get lost. | No breadcrumb component/page. |
| **Filtering is hardcoded** | Filters (brand, price, sort) are manually wired per page, not attribute-driven. Adding a new category with new attributes requires code edits → breaks scale. | `CategoryPage.jsx` builds filters by hand. |
| **Filter state not shareable** | Filters/sort live only in component state — not in the URL. No deep-linking, no back-button fidelity, not SSR-friendly. | Filters are `useState`. |
| **Comparison before purchase is weak** | Single fixed "featured product" card in mega-menu; no way to weigh multiple options. | `Header.jsx` `featured = catalog.products[0]`. |
| **Empty / loading states** | Category has basic loading/empty states; cart has an empty state — but search, comparison, checkout, and error handling are not consistently covered. | Mixed coverage across pages. |
| **Product imagery** | All products use emoji placeholders (`images: []`). This is the single biggest trust/visual gap for a "professional, trustworthy" store. | `products.base.js`. |
| **Reviews/ratings** | Not built at all, though it is central to an Amazon-like trust model. | No review data or UI. |

---

## 3. Improve immediately (Tier 1 — complete the buying loop)

Finish the core commerce experience end-to-end. These close the loop from "browse" to "ordered".

1. **Real checkout flow** — a checkout page/drawer with:
   - contact + shipping info form (validated),
   - order summary with clear line items,
   - payment method selection,
   - order confirmation screen with an order reference,
   - keep WhatsApp as an *option*, not the only path.
2. **Add-to-cart from every listing** — grid cards (category, home, search) get an "add to cart"
   button and qty control, so users can add without a detour.
3. **Product comparison** — a compare tray where a user picks 2–4 products from the same category and
   sees a side-by-side attribute table. Persist the compare list in the same storage pattern as the cart.

**Acceptance:** a first-time visitor can find a product, compare it, add it, and complete an order —
all in under a minute, on mobile.

---

## 4. Design differently for a large catalog (Tier 2 — scale readiness)

These make the site *stay* simple as the catalog explodes.

1. **Add real subcategories** under each department (`piping` → `elbows`, `valves`, `glue`; etc.).
   The tree already supports arbitrary depth — use it.
2. **Rendered in the mega-menu** as a two-column parent → child structure, not a flat list.
3. **Breadcrumbs** on category and product pages: Home › Piping › Elbows › Product.
4. **Attribute-driven faceted search.** Introduce an `attributes` object on products (power,
   diameter, flow, material, etc.). Filters are then *generated from the data*, not hardcoded —
   so every new category/products get the right filters automatically. This is the key to scale.
5. **Filters/sort/query live in the URL** (`?brand=hayward&min=…&max=…&sort=price-asc`) so filtered
   views are shareable, bookmarkable, browser-back friendly, and SSR-prerenderable.
6. **Product listing toolbar** (sort, page size, active-filter chips) built as one reusable,
   data-driven component reused by category + search pages.

---

## 5. Reusable components (build once, use everywhere)

| Component | Consumed by | Why |
|-----------|-------------|-----|
| `ProductCard` | Home, Category, Search, related | single card incl. add-to-cart, badge, compare toggle |
| `FacetedFilterBar` | Category, Search | attribute-driven, URL-backed |
| `Breadcrumbs` | Category, Product | consistent wayfinding |
| `CompareTray` | global | persists across pages |
| `CheckoutFlow` | global | cart → checkout → confirmation |
| `ProductGrid` | Home, Category, Search | grid + load-more + empty state |

---

## 6. Architecture prepared for future expansion

Already reserved in the data layer, and what unlocks each:

| Future capability | Already reserved | Next step |
|-------------------|------------------|-----------|
| Categories / subcategories | tree supports depth | add real children; render them |
| Brands | `brands.js` + `brandId` | `/brand/:slug` page |
| Product variations / attributes | — | add `attributes` + `variants` |
| Multiple vendors | `vendorId` | vendor entity + seller UI |
| Promotions / discounts | `badge` | add `compareAtPrice` + discount math |
| Inventory | `inStock` (boolean) | expand to lead-time / backorder |
| Orders / accounts | cart only | order store + lightweight accounts |
| Reviews / ratings | — | review data model + aggregate |
| Multi-currency | `currency` field | currency switch + formatting |
| Real images | `images` array | asset pipeline / CDN |
| Search at scale | token index | typo tolerance, facets, synonyms |
| Marketplace / APIs | modular catalog | keep selectors pure; prep an API layer |

---

## 7. Evolution path: pool store → broad e-commerce

Phase-based, non-breaking.

- **Phase A (now):** Complete checkout, add-to-cart on grid, comparison. *= finishing today's product.*
- **Phase B:** Subcategories, breadcrumbs, attribute-driven filters, URL-filter state. *= proving scale.*
- **Phase C (trust):** Reviews/ratings, real images, promotions, brand pages. *= becoming trustworthy.*
- **Phase D (platform):** Accounts, order history, vendors, multi-currency, marketplace/API. *= becoming a platform.*

Each phase ships independently and never requires rewriting earlier work.

---

## 8. Keep it simple — what we deliberately do NOT build yet

- No server-side user database until accounts are actually needed (contracted order flow works first).
- No real inventory/vendor management — data fields reserved, processing comes later.
- No TypeScript yet — but `validateContent()` and pure selectors make a later migration low-risk.
- No new visual design.

We add complexity only when a real user need requires it — but every field/component we touch keeps
the door open for the later phases.
