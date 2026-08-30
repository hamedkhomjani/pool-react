// Category tree. `slug` doubles as the route segment and the i18n label key
// (categories.<slug>). `parentId: null` marks a top-level node; subcategories
// point at their parent slug. The tree supports arbitrary depth so new
// departments/subcategories can be added without code changes.

export const categories = [
  { slug: 'pump', parentId: null, icon: '⚙️', featured: true, sort: 1 },
  { slug: 'filter', parentId: null, icon: '🌪️', featured: true, sort: 2 },
  { slug: 'heater', parentId: null, icon: '🔥', featured: true, sort: 3 },
  { slug: 'lighting', parentId: null, icon: '💡', featured: true, sort: 4 },
  { slug: 'disinfection', parentId: null, icon: '🧪', featured: true, sort: 5 },
  { slug: 'accessories', parentId: null, icon: '🪜', featured: true, sort: 6 },
  { slug: 'piping', parentId: null, icon: '🔧', featured: true, sort: 7 },
]

export default categories