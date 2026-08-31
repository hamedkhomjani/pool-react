# AquaPro — Swimming Pool Storefront

Bilingual (EN/FA) React + Vite storefront for AquaPro (آکوا پرو), built as a scalable foundation
for a future large-scale e-commerce platform.

## Stack

- **React 19 + Vite 8**
- **react-router-dom 7** with lazy code-split pages
- **i18next / react-i18next** with lazy-loaded EN/FA locale chunks
- **Build-time prerendering** (SSR) for SEO (`scripts/prerender.mjs`)
- **oxlint** for linting
- A **catalog-driven data layer** (`src/data/catalog`) that separates structural product facts from
  localized marketing content.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server
npm run build    # production build + prerender
npm run lint     # oxlint
npm run preview  # preview the production build
```

## Architecture overview

- **`src/data/catalog/products.base.js`** — locale-independent product facts (key, category,
  brandId, model, price, currency, inStock, vendorId, images, featured).
- **`src/data/catalog/content/<lang>.js`** — localized titles/descriptions/features/specs keyed by
  product key. Loaded lazily per language; consistency is validated at build time.
- **`src/data/catalog/categories.js`** — category tree supporting arbitrary depth.
- **`src/data/catalog/brands.js`** — brand entities.
- **`src/data/catalog/index.js`** — `createCatalog(lang)` merges facts + localized content and
  exposes selectors (product lookup, category products, ranked search).
- **`src/context/CartContext.jsx`** — localStorage-backed cart.
- **`src/routes.js`** — single source of truth for routes (also used by the prerenderer).

## UX & scale strategy

The full strategy lives in **[UX_STRATEGY.md](./UX_STRATEGY.md)**. Summary:

### What stays unchanged
- Visual identity, colors, dark mode, EN/FA localization, SSR/SEO, the catalog data model, and cart.

### Foundation for scale
The data layer already reserves fields for what a larger catalog needs:
`currency`, `brandId`, `vendorId`, `inStock`, `images`, and the category tree already supports
subcategories. The roadmap then builds on that base in non-breaking phases.

### Tier 1 — complete the buying loop (in progress)
- Real **checkout flow** (contact/shipping form → payment → confirmation), with WhatsApp kept as an option.
- **Add-to-cart** directly from product listing cards.
- **Product comparison** tray (side-by-side attributes).

### Tier 2 — catalog depth & scale readiness (next)
- Real subcategories rendered in the mega-menu + breadcrumbs.
- **Attribute-driven faceted filters** (generated from product data, not hardcoded).
- Filters/sort/query persisted in the **URL** for shareable, back-button-friendly states.

### Later phases
Reviews & ratings, real product imagery, promotions, brand pages, then accounts & order history,
multiple vendors, multi-currency, and marketplace/API features.

## Notes
- Emoji product icons are placeholders until the `images` asset pipeline lands.
- All product, category, and brand content must exist in **both** `content/en.js` and `content/fa.js`
  — the catalog loader fails the build if they drift.
