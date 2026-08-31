// Pure product filtering/sorting + facet generation for category and search
// pages. Kept outside components so it can be unit-tested and reused at scale.
//
// Facets are derived from product `attributes` (a flat map of attributeKey ->
// value) rather than being hardcoded, so adding a new category or product
// attribute automatically produces the right filter UI with zero code changes.

export const PAGE_SIZE = 6

export const SORTS = ['featured', 'price-asc', 'price-desc', 'name']

function matchesBrand(products, brands) {
  if (brands.length === 0) return products
  const set = new Set(brands)
  return products.filter(p => set.has(p.brandId))
}

function matchesPrice(products, { min, max }) {
  let result = products
  const lo = Number(min)
  const hi = Number(max)
  if (min !== '' && Number.isFinite(lo)) result = result.filter(p => p.price >= lo)
  if (max !== '' && Number.isFinite(hi)) result = result.filter(p => p.price <= hi)
  return result
}

function matchesFacets(products, facets) {
  // facets: { attributeKey: [value1, value2, ...] } — a product matches when
  // its attribute value is among the selected values for every active group.
  const active = Object.entries(facets || {}).filter(([, values]) => values && values.length > 0)
  if (active.length === 0) return products
  return products.filter(p =>
    active.every(([key, values]) => {
      const val = p.attributes ? p.attributes[key] : undefined
      return val != null && values.includes(val)
    }),
  )
}

function applySort(products, sort, sortLang) {
  if (sort === 'price-asc') {
    return [...products].sort((a, b) => a.price - b.price)
  }
  if (sort === 'price-desc') {
    return [...products].sort((a, b) => b.price - a.price)
  }
  if (sort === 'name') {
    return [...products].sort((a, b) => a.title.localeCompare(b.title, sortLang))
  }
  return products
}

export function filterProducts(products, { brands = [], min = '', max = '', facets = {}, sort = 'featured', sortLang = 'en' } = {}) {
  let result = matchesBrand(products, brands)
  result = matchesPrice(result, { min, max })
  result = matchesFacets(result, facets)
  return applySort(result, sort, sortLang)
}

// Derives filterable facet groups from a product list based on the product
// `attributes` map. Returns an array of { key, values, counts } where `values`
// are the distinct attribute values (in first-seen order) and `counts` maps
// each value to how many products carry it. Ordered by the attribute's label
// order (see attributeOrder) so the UI stays stable.
export function buildFacets(products, attributeOrder = []) {
  const groups = new Map()
  for (const p of products) {
    const attrs = p.attributes || {}
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue
      if (!groups.has(key)) groups.set(key, new Map())
      const counts = groups.get(key)
      counts.set(value, (counts.get(value) || 0) + 1)
    }
  }
  const entries = Array.from(groups.entries()).map(([key, counts]) => ({
    key,
    values: Array.from(counts.keys()),
    counts,
  }))
  if (attributeOrder.length > 0) {
    const order = new Map(attributeOrder.map((k, i) => [k, i]))
    entries.sort((a, b) => (order.get(a.key) ?? Infinity) - (order.get(b.key) ?? Infinity))
  }
  return entries
}

// Whether any filter (brand, price, facet) is active.
export function hasActiveFilters({ brands = [], min = '', max = '', facets = {} } = {}) {
  if (brands.length > 0 || min !== '' || max !== '') return true
  return Object.values(facets).some(values => values && values.length > 0)
}
