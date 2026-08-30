// Brand entities. `slug` will back future /brand/:slug pages and follow the
// same i18n pattern (brands.<slug> for any localized bio). Brand names are
// locale-independent. Products reference a brand via `brandId`; a product
// without one (null) is fine and renders without a brand link.

export const brands = [
  { slug: 'hayward', name: 'Hayward', featured: true, sort: 1 },
  { slug: 'emaux', name: 'Emaux', featured: true, sort: 2 },
  { slug: 'aquapro', name: 'AquaPro', featured: true, sort: 3 },
]

export default brands