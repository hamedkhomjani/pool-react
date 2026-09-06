// Catalog loader + selectors — the single read path for product data.
//
// Structural facts (categories, brands, product base) are static imports.
// Localized marketing content (content/<lang>.js) is lazy-loaded per language
// and cached, mirroring the i18n locale-chunk pattern so an fa user never
// downloads English product copy. Selectors are built by createCatalog(lang)
// once the content for that language is available; consumers should use the
// useCatalog() hook (src/hooks/useCatalog.js).
//
// SSR/prerender: warm the target language with loadCatalogContent(lang) BEFORE
// renderToString so the first render is complete (see src/ssr/entry.jsx).

import { categories } from './categories.js'
import { brands } from './brands.js'
import productsBase from './products.base.js'

const cached = {}

// Loads (once) and validates the localized content for a language. Resolves
// to the content object. Failures are not cached, so a later retry works.
export function loadCatalogContent(lang) {
  if (cached[lang]) return cached[lang]

  const promise = (lang === 'fa'
    ? import('./content/fa.js')
    : import('./content/en.js')
  ).then(mod => {
    const content = mod.default
    validateContent(content, lang)
    cached[lang] = content
    return content
  })

  promise.catch(() => {
    delete cached[lang]
  })
  return promise
}

// Synchronous accessor for already-loaded content. Returns null until
// loadCatalogContent(lang) has resolved.
export function getCatalogContentSync(lang) {
  return cached[lang] || null
}

// Guards against catalog drift: every product must have content in every
// language, content must not reference unknown products, and each entry must
// carry the full shape. Throws so the build/prerender fails loudly.
function validateContent(content, lang) {
  const keys = Object.keys(content)
  const baseKeys = new Set(productsBase.map(p => p.key))
  const problems = []

  const missing = productsBase.filter(p => !keys.includes(p.key)).map(p => p.key)
  const extra = keys.filter(k => !baseKeys.has(k))
  if (missing.length) problems.push(`missing products: ${missing.join(', ')}`)
  if (extra.length) problems.push(`unknown products: ${extra.join(', ')}`)

  for (const key of keys) {
    const entry = content[key]
    for (const field of ['title', 'desc', 'longDesc', 'features', 'specs', 'detailSpecs']) {
      if (entry[field] === undefined) problems.push(`${key} missing "${field}"`)
    }
    if (entry.badge !== undefined && entry.badge !== null && typeof entry.badge !== 'string') {
      problems.push(`${key} badge must be string|null`)
    }
    if (entry.reviews !== undefined) {
      if (!Array.isArray(entry.reviews)) {
        problems.push(`${key} reviews must be an array`)
      } else {
        entry.reviews.forEach((r, i) => {
          if (!r || typeof r.id !== 'number' || typeof r.author !== 'string' ||
              !Number.isFinite(r.rating) || typeof r.text !== 'string') {
            problems.push(`${key} reviews[${i}] must be { id:number, author:string, rating:number, text:string }`)
          }
        })
      }
    }
  }

  if (problems.length) {
    throw new Error(`[catalog:${lang}] ${problems.join('; ')}`)
  }
}

// Per-language search indexes are built lazily and cached forever (content
// for a language is immutable once loaded).
const searchIndexes = new Map()

function buildSearchIndex(lang, products, brands) {
  const brandName = new Map(brands.map(b => [b.slug, b.name.toLowerCase()]))
  const haystacks = products.map(p => {
    const brand = p.brandId ? brandName.get(p.brandId) || '' : ''
    const text = [
      p.title,
      p.desc,
      p.key,
      p.model || '',
      brand,
      p.category,
      ...Object.values(p.specs || {}),
      ...Object.values(p.detailSpecs || {}),
    ]
      .join(' ')
      .toLowerCase()
    return { p, text }
  })
  const index = { haystacks }
  searchIndexes.set(lang, index)
  return index
}

// Ranked, token-based search. All query tokens must appear in a product's
// haystack; title/model/key matches boost the score. Returns the merged
// products in descending match order.
function searchProducts(lang, products, brands, query) {
  const raw = (query || '').trim().toLowerCase()
  if (!raw) return []
  const tokens = raw.split(/\s+/)
  const { haystacks } = searchIndexes.get(lang) || buildSearchIndex(lang, products, brands)

  const scored = []
  for (const { p, text } of haystacks) {
    let score = 0
    let allMatched = true
    for (const token of tokens) {
      if (text.includes(token)) {
        score += 1
      } else {
        allMatched = false
        break
      }
    }
    if (!allMatched) continue

    if (p.title.toLowerCase().includes(raw)) score += 6
    if ((p.model || '').toLowerCase().includes(raw)) score += 4
    if (p.key.toLowerCase().includes(raw)) score += 3
    if ((p.desc || '').toLowerCase().includes(raw)) score += 1
    scored.push({ p, score })
  }

  return scored.sort((a, b) => b.score - a.score).map(x => x.p)
}

// Builds a full catalog snapshot for a language, or null if its content has
// not been loaded yet. Products are the base facts merged with localized
// content, keeping the base-array order (stable, and matches category lists).
export function createCatalog(lang) {
  const content = getCatalogContentSync(lang)
  if (!content) return null

  const categoryMap = new Map(categories.map(c => [c.slug, c]))
  const brandMap = new Map(brands.map(b => [b.slug, b]))
  const products = productsBase.map(p => ({ ...p, ...content[p.key] }))

  // Ordered descendants of a category (itself excluded). Cheap BFS over the
  // tree so a department browse surfaces every product in its subcategories.
  const descendantsOf = slug => {
    const out = []
    const queue = categories
      .filter(c => c.parentId === slug)
      .sort((a, b) => a.sort - b.sort)
    while (queue.length) {
      const node = queue.shift()
      out.push(node.slug)
      queue.push(...categories.filter(c => c.parentId === node.slug))
    }
    return out
  }

  // Category → ancestors (self excluded, top-first) for breadcrumbs.
  const ancestorsOf = slug => {
    const out = []
    let current = categoryMap.get(slug)
    while (current && current.parentId) {
      const parent = categoryMap.get(current.parentId)
      if (parent) out.unshift(parent.slug)
      current = parent
    }
    return out
  }

  return {
    lang,
    categories,
    topCategories: categories.filter(c => c.parentId === null),
    products,
    brands,
    category: slug => categoryMap.get(slug),
    categoryChildren: slug =>
      categories.filter(c => c.parentId === slug).sort((a, b) => a.sort - b.sort),
    categoryAncestors: ancestorsOf,
    categoryDescendants: descendantsOf,
    product: key => products.find(p => p.key === key),
    categoryProducts: slug => {
      const slugs = new Set([slug, ...descendantsOf(slug)])
      return products.filter(p => slugs.has(p.category))
    },
    categoryFeatured: slug => products.find(p => p.category === slug),
    brand: slug => brandMap.get(slug),
    brandProducts: slug => products.filter(p => p.brandId === slug),
    search: query => searchProducts(lang, products, brands, query),
  }
}

export default createCatalog