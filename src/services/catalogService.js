import { supabase } from '../config/supabase'
import staticProducts from '../data/catalog/products.base'
import staticCategories from '../data/catalog/categories'
import staticBrands from '../data/catalog/brands'
import staticContentFa from '../data/catalog/content/fa'
import staticContentEn from '../data/catalog/content/en'

// Transform Supabase product row into frontend catalog format
export function transformProductRow(row, lang = 'fa') {
  const isEn = lang === 'en'
  const title = isEn ? (row.title_en || row.title_fa) : (row.title_fa || row.title_en)
  const subtitle = isEn ? (row.subtitle_en || row.subtitle_fa) : (row.subtitle_fa || row.subtitle_en)
  const desc = isEn ? (row.description_en || row.description_fa) : (row.description_fa || row.description_en)
  const features = isEn ? (row.features_en || row.features_fa || []) : (row.features_fa || row.features_en || [])

  // Featured if explicitly set, or if has badge/discount, or default true for first items
  const isFeatured = row.featured !== undefined && row.featured !== null 
    ? Boolean(row.featured) 
    : Boolean(row.badge || row.compare_at)

  return {
    id: row.id,
    key: row.key,
    category: row.category_id,
    brandId: row.brand_id,
    price: Number(row.price),
    compareAt: row.compare_at ? Number(row.compare_at) : null,
    inStock: row.in_stock,
    badge: row.badge || null,
    featured: isFeatured,
    offerExpiresAt: row.offer_expires_at || null,
    icon: row.image ? null : '⚙️',
    images: row.image ? [row.image, ...(row.gallery || [])] : (row.gallery || []),
    image: row.image || null,
    gallery: row.gallery || [],
    title,
    subtitle,
    description: desc,
    desc,
    longDesc: desc,
    specs: row.specs || {},
    detailSpecs: row.specs || {},
    features,
    raw: row,
  }
}

// Fetch all products from Supabase
export async function getProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch error, using fallback:', error.message)
      return null
    }

    if (!data || data.length === 0) {
      return null // will trigger fallback or auto-seed
    }

    return data
  } catch (err) {
    console.warn('Failed to connect to Supabase:', err)
    return null
  }
}

// Upload product image to Supabase Storage bucket
export async function uploadProductImage(file) {
  if (!file) return null
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error('Image upload failed:', err)
    throw err
  }
}

// Helper to ensure category and brand foreign keys exist in Supabase
export async function ensureCategoriesAndBrands() {
  try {
    const categoriesPayload = staticCategories.map(c => ({
      id: c.slug,
      name_fa: c.slug,
      name_en: c.slug,
      description_fa: '',
      description_en: '',
      icon: c.icon || '',
    }))
    const { error: catErr } = await supabase.from('categories').upsert(categoriesPayload)
    if (catErr) console.error('Category upsert error:', catErr)

    const brandsPayload = staticBrands.map(b => ({
      id: b.slug,
      name: b.name,
      description_fa: '',
      description_en: '',
    }))
    const { error: brandErr } = await supabase.from('brands').upsert(brandsPayload)
    if (brandErr) console.error('Brand upsert error:', brandErr)
  } catch (err) {
    console.warn('Pre-seed categories/brands warning:', err)
  }
}

// Generate valid key slug from product title or timestamp
function generateSlug(key, titleEn, titleFa) {
  if (key && key.trim()) return key.trim()
  
  let base = (titleEn || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  if (!base || base === '-') {
    base = `product-${Date.now().toString(36)}`
  }
  return base.replace(/^-+|-+$/g, '')
}

// Upsert (Create or Update) Product
export async function saveProductToSupabase(productData) {
  // Ensure foreign key category/brand rows exist first
  await ensureCategoriesAndBrands()

  const productKey = generateSlug(productData.key, productData.title_en, productData.title_fa)

  const payload = {
    key: productKey,
    category_id: productData.category_id || 'pump',
    brand_id: productData.brand_id || null,
    price: Number(productData.price) || 0,
    compare_at: productData.compare_at ? Number(productData.compare_at) : null,
    in_stock: productData.in_stock !== false,
    featured: Boolean(productData.featured),
    offer_expires_at: productData.offer_expires_at || null,
    badge: productData.badge || null,
    image: productData.image || null,
    gallery: productData.gallery || [],
    title_fa: productData.title_fa || '',
    title_en: productData.title_en || productData.title_fa || '',
    subtitle_fa: productData.subtitle_fa || '',
    subtitle_en: productData.subtitle_en || '',
    description_fa: productData.description_fa || '',
    description_en: productData.description_en || '',
    specs: productData.specs || {},
    features_fa: productData.features_fa || [],
    features_en: productData.features_en || [],
    updated_at: new Date().toISOString(),
  }

  if (productData.id) {
    // Update
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productData.id)
      .select()
    if (error) throw error
    return data[0]
  } else {
    // Insert
    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }
}

// Delete Product
export async function deleteProductFromSupabase(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return true
}

// Quick toggle stock status
export async function toggleProductStockInSupabase(id, inStock) {
  const { data, error } = await supabase
    .from('products')
    .update({ in_stock: inStock, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// Quick update price directly
export async function updateProductPriceInSupabase(id, newPrice) {
  const { data, error } = await supabase
    .from('products')
    .update({ price: Number(newPrice), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// Batch Update Stock Status
export async function batchUpdateStockInSupabase(ids, inStock) {
  const { data, error } = await supabase
    .from('products')
    .update({ in_stock: inStock, updated_at: new Date().toISOString() })
    .in('id', ids)
    .select()
  if (error) throw error
  return data
}

// Batch Delete Products
export async function batchDeleteProductsFromSupabase(ids) {
  const { error } = await supabase.from('products').delete().in('id', ids)
  if (error) throw error
  return true
}

// Seed static catalog to Supabase if database is empty
export async function seedStaticCatalogToSupabase() {
  try {
    await ensureCategoriesAndBrands()

    const { data: existing } = await supabase.from('products').select('id').limit(1)
    if (existing && existing.length > 0) {
      return { seeded: false, message: 'Database already has products' }
    }

    // Seed products
    const productsPayload = staticProducts.map(p => {
      const contentFa = staticContentFa[p.key] || {}
      const contentEn = staticContentEn[p.key] || {}
      return {
        key: p.key,
        category_id: p.category,
        brand_id: p.brandId,
        price: p.price,
        compare_at: p.compareAt,
        in_stock: p.inStock,
        badge: contentFa.badge || null,
        title_fa: contentFa.title || p.key,
        title_en: contentEn.title || p.key,
        subtitle_fa: contentFa.subtitle || '',
        subtitle_en: contentEn.subtitle || '',
        description_fa: contentFa.description || contentFa.longDesc || contentFa.desc || '',
        description_en: contentEn.description || contentEn.longDesc || contentEn.desc || '',
        specs: p.attributes || contentFa.specs || contentFa.detailSpecs || {},
        features_fa: contentFa.features || [],
        features_en: contentEn.features || [],
      }
    })

    const { error } = await supabase.from('products').insert(productsPayload)
    if (error) throw error

    return { seeded: true, count: productsPayload.length }
  } catch (err) {
    console.error('Seeding failed:', err)
    return { seeded: false, error: err.message }
  }
}
