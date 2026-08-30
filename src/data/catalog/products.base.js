// Locale-independent product facts (what a product API would return as
// identifiers and codes). Localized marketing content — titles, descriptions,
// features, specs — lives in content/<lang>.js and is merged by the catalog
// loader (src/data/catalog/index.js).
//
// Field contract:
//   key        unique slug (route segment /product/<key>)
//   category   category slug (see categories.js)
//   brandId    brand slug or null (see brands.js)
//   model      manufacturer model code
//   price      numeric toman price (display formatting is applied by UI)
//   currency   ISO code, reserved for multi-currency later
//   inStock    boolean; drives availability UI
//   vendorId   reserved for future marketplace/vendors (null today)
//   icon       temporary emoji placeholder until `images` are supplied
//   images     real image URLs, populated as the media pipeline lands
//   sort       stable ordering within a category
//   featured   boolean; curated into the homepage "featured" strip

export const products = [
  {
    key: 'hw1500',
    category: 'pump',
    brandId: 'hayward',
    model: 'HW-1500',
    price: 12500000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '⚙️',
    images: [],
    sort: 1,
    featured: true,
  },
  {
    key: 'mega650',
    category: 'filter',
    brandId: 'emaux',
    model: 'MEGA-650',
    price: 18200000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🌪️',
    images: [],
    sort: 1,
    featured: true,
  },
  {
    key: 'uv85',
    category: 'disinfection',
    brandId: null,
    model: 'UV-85P',
    price: 9800000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🧪',
    images: [],
    sort: 1,
    featured: true,
  },
  {
    key: 'ht36',
    category: 'heater',
    brandId: 'hayward',
    model: 'HT-36',
    price: 28500000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🔥',
    images: [],
    sort: 1,
  },
  {
    key: 'swg40',
    category: 'disinfection',
    brandId: 'aquapro',
    model: 'SWG-40',
    price: 15800000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🧂',
    images: [],
    sort: 2,
  },
  {
    key: 'led18',
    category: 'lighting',
    brandId: 'aquapro',
    model: 'LED-18RGB',
    price: 4800000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '💡',
    images: [],
    sort: 1,
    featured: true,
  },
  {
    key: 'pipe50',
    category: 'piping',
    brandId: null,
    model: 'PVC-50',
    price: 850000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🔧',
    images: [],
    sort: 1,
  },
  {
    key: 'fitkit50',
    category: 'piping',
    brandId: null,
    model: 'FITTING-KIT-50',
    price: 1250000,
    currency: 'IRR',
    inStock: true,
    vendorId: null,
    icon: '🔩',
    images: [],
    sort: 2,
  },
]

export default products