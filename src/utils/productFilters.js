// Pure product filtering/sorting for category and search pages.
// Kept outside components so it can be unit-tested and reused at scale.

export const PAGE_SIZE = 6

export const SORTS = ['featured', 'price-asc', 'price-desc', 'name']

// Cheap, deterministic default that keeps the catalog's base order intact
// while making pagination offsets stable enough for cache-friendly lists.
export function filterProducts(products, { brands = [], min = '', max = '', sort = 'featured', sortLang = 'en' } = {}) {
  let result = products

  if (brands.length > 0) {
    const brandSet = new Set(brands)
    result = result.filter(p => brandSet.has(p.brandId))
  }

  const lo = Number(min)
  const hi = Number(max)
  if (min !== '' && Number.isFinite(lo)) result = result.filter(p => p.price >= lo)
  if (max !== '' && Number.isFinite(hi)) result = result.filter(p => p.price <= hi)

  if (sort === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price)
  } else if (sort === 'name') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, sortLang))
  }

  return result
}

export function hasActiveFilters({ brands = [], min = '', max = '' } = {}) {
  return brands.length > 0 || min !== '' || max !== ''
}