import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { supabase } from '../config/supabase'
import { saveProductToSupabase } from './catalogService'

// Column set used by export AND expected by import — a file exported from the
// admin panel can be edited and imported back directly (safe round-trip).
export const EXPORT_HEADERS = [
  'key',
  'title_fa',
  'title_en',
  'subtitle_fa',
  'subtitle_en',
  'description_fa',
  'description_en',
  'price',
  'compare_at',
  'in_stock',
  'badge',
  'featured',
  'category_id',
  'brand_id',
  'offer_expires_at',
  'features_fa',
  'features_en',
  'specs',
]

function normalizeRow(row) {
  const out = {}
  for (const key of Object.keys(row || {})) out[String(key).trim()] = row[key]
  return out
}

function toBool(value) {
  if (value === undefined || value === null || value === '') return undefined
  const s = String(value).trim().toLowerCase()
  return ['1', 'true', 'yes', 'y', 'بله', 'موجود', 'فعال'].includes(s)
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function splitList(value) {
  if (!value) return []
  return String(value)
    .split(/[|\n\r]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

function tryParseJson(value) {
  if (typeof value === 'object' && value !== null) return value
  try {
    return JSON.parse(String(value))
  } catch {
    return {}
  }
}

export async function parseCatalogFile(file) {
  const name = (file.name || '').toLowerCase()
  const isTsv = name.endsWith('.tsv')
  const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls')

  if (isXlsx) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(ws, { defval: '' }).map(normalizeRow)
  }

  const text = await file.text()
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: 'greedy',
    delimiter: isTsv ? '\t' : ',',
  })
  return (parsed.data || []).map(normalizeRow)
}

// Maps one spreadsheet row to a product payload, or an error string.
export function rowToProductPayload(row) {
  const price = toNumber(row.price)
  const titleFa = String(row.title_fa ?? '').trim()
  if (!titleFa) return { payload: null, error: 'عنوان فارسی (title_fa) خالی است' }
  if (price === undefined) return { payload: null, error: 'قیمت (price) عدد معتبر نیست' }

  return {
    payload: {
      key: String(row.key ?? '').trim() || undefined,
      title_fa: titleFa,
      title_en: String(row.title_en ?? '').trim(),
      subtitle_fa: String(row.subtitle_fa ?? '').trim(),
      subtitle_en: String(row.subtitle_en ?? '').trim(),
      description_fa: String(row.description_fa ?? '').trim(),
      description_en: String(row.description_en ?? '').trim(),
      price,
      compare_at: toNumber(row.compare_at),
      in_stock: toBool(row.in_stock) ?? true,
      featured: toBool(row.featured) ?? false,
      badge: String(row.badge ?? '').trim() || null,
      category_id: String(row.category_id ?? 'pump').trim(),
      brand_id: String(row.brand_id ?? '').trim() || null,
      offer_expires_at: String(row.offer_expires_at ?? '').trim() || null,
      features_fa: splitList(row.features_fa),
      features_en: splitList(row.features_en),
      specs: tryParseJson(row.specs),
    },
    error: null,
  }
}

// Parses a file and upserts every valid row by `key` (new rows inserted,
// existing rows updated). Returns a summary with per-row failures.
export async function importProductsFromFile(file) {
  const rows = await parseCatalogFile(file)
  if (rows.length === 0) {
    throw new Error('فایل انتخابی خالی است یا ستونی ندارد.')
  }

  const added = []
  const updated = []
  const failed = []

  for (let i = 0; i < rows.length; i++) {
    const { payload, error } = rowToProductPayload(rows[i])
    const label = rows[i].key || rows[i].title_fa || `سطر ${i + 2}`
    if (error || !payload) {
      failed.push({ row: i + 2, reason: error })
      continue
    }

    try {
      let id = null
      if (payload.key) {
        const { data } = await supabase
          .from('products')
          .select('id')
          .eq('key', payload.key)
          .maybeSingle()
        if (data) id = data.id
      }
      await saveProductToSupabase({ ...payload, id })
      if (id) updated.push(payload.key || label)
      else added.push(payload.key || label)
    } catch (err) {
      failed.push({ row: i + 2, reason: err.message })
    }
  }

  return { total: rows.length, added: added.length, updated: updated.length, failed }
}

function rowFromProduct(p) {
  const raw = p.raw || {}
  return {
    key: p.key || '',
    title_fa: raw.title_fa || p.title || '',
    title_en: raw.title_en || '',
    subtitle_fa: raw.subtitle_fa || '',
    subtitle_en: raw.subtitle_en || '',
    description_fa: raw.description_fa || p.description || '',
    description_en: raw.description_en || '',
    price: p.price ?? '',
    compare_at: p.compareAt ?? '',
    in_stock: p.inStock ? 'true' : 'false',
    badge: p.badge || '',
    featured: p.featured ? 'true' : 'false',
    category_id: p.category || '',
    brand_id: p.brandId || '',
    offer_expires_at: String(p.offerExpiresAt || raw.offer_expires_at || '').substring(0, 16),
    features_fa: Array.isArray(raw.features_fa) ? raw.features_fa.join('|') : '',
    features_en: Array.isArray(raw.features_en) ? raw.features_en.join('|') : '',
    specs: raw.specs && typeof raw.specs === 'object' ? JSON.stringify(raw.specs) : '',
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Downloads all products in the requested format ('csv' | 'tsv' | 'xlsx').
export function exportProducts(products, format = 'csv') {
  const rows = products.map(rowFromProduct)
  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'products')
    XLSX.writeFile(wb, `products-${stamp}.xlsx`)
    return
  }

  const delimiter = format === 'tsv' ? '\t' : ','
  const data = rows.map((r) => EXPORT_HEADERS.map((h) => r[h]))
  const csv = Papa.unparse({ fields: EXPORT_HEADERS, data }, { delimiter })
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `products-${stamp}.${format === 'tsv' ? 'tsv' : 'csv'}`)
}