// Builds the AquaPro knowledge base from the website's own content.
//
// Sources (read from the React app):
//   - Full buying guides   (src/i18n/locales/en.json -> fullGuides)
//   - Product catalog      (src/data/catalog)
//   - Contact info         (src/i18n/locales/en.json -> contact)
//
// Output: chatbot/kb/chunks.json — a list of plain-text chunks used for
// retrieval. The chatbot answers ONLY from this file, so it never invents
// facts about the products.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
const enPath = join(repoRoot, 'src', 'i18n', 'locales', 'en.json')
const outDir = join(__dirname, '..', 'kb')
const outPath = join(outDir, 'chunks.json')

const en = JSON.parse(readFileSync(enPath, 'utf8'))

// Import the catalog modules (ESM) for keys, category slugs and branding.
let catalog = { categories: [], products: [] }
try {
  const { categories } = await import(
    pathToFileURL(join(repoRoot, 'src/data/catalog/categories.js')).href
  )
  const { default: products } = await import(
    pathToFileURL(join(repoRoot, 'src/data/catalog/products.base.js')).href
  )
  catalog = { categories, products }
} catch {
  // keep empty catalog
}

class Chunk {
  constructor(type, title, text, meta = {}) {
    this.type = type
    this.title = title
    this.text = text
    this.meta = meta
  }
}

const chunks = []

function add(type, title, text, meta = {}) {
  const cleaned = (text || '').trim()
  if (!cleaned) return
  chunks.push(new Chunk(type, title, cleaned, meta))
}

const CATEGORY_NAMES = {
  pump: 'Pool Pumps',
  filter: 'Pool Filters',
  heater: 'Pool Heaters',
  lighting: 'Pool Lighting',
  disinfection: 'Disinfection (UV & Saltwater)',
  accessories: 'Pool Accessories',
  piping: 'Pipes & Fittings',
}

// ---- Standalone pump guide (lives under en.guide) ----------------------
{
  const guide = en.guide
  const s = guide.sections || {}
  const catName = 'Pool Pumps'

  add('guide', `${catName}: introduction`, `${guide.title}.\n${guide.lead || ''}`)
  add('guide', `${catName}: why it matters`, s.whyP1)
  add('guide', `${catName}: hidden costs`, `Hidden costs to watch for:\n${(s.hiddenCosts || []).join('\n')}`)
  add('guide', `${catName}: types`, `${s.typesP || ''}\n${(s.pumpTypes || s.types || []).map(t => `- ${t.title}: ${t.desc}`).join('\n')}`)
  add('guide', `${catName}: sizing`, `${s.sizingP1 || ''}\n${(s.sizingRows || []).map(r => Object.values(r).join(' | ')).join('\n')}`)
  add('guide', `${catName}: piping`, s.pipingP)
  add('guide', `${catName}: disinfection pairing`, `${s.diffP || ''}\n${(s.cluster || []).join('\n')}`)
  for (const c of s.specCards || []) {
    add('guide', `${catName}: ${c.title}`, c.desc)
  }
  for (const b of s.brands || []) {
    add('guide', `${catName}: brand ${b.name}`, b.desc)
  }
  for (const f of s.faqs || []) {
    add('faq', `${catName} — ${f.q}`, `Q: ${f.q}\nA: ${f.a}`)
  }
}

// ---- Full buying guides ------------------------------------------------
for (const [slug, guide] of Object.entries(en.fullGuides || {})) {
  const catName = CATEGORY_NAMES[slug] || slug
  const s = guide.sections || {}

  add('guide', `${catName}: introduction`, `${guide.title}.\n${guide.lead || ''}`)
  add('guide', `${catName}: why it matters`, s.whyP1)
  add('guide', `${catName}: hidden costs`, `Hidden costs to watch for:\n${(s.hiddenCosts || []).join('\n')}`)
  add('guide', `${catName}: types`, `${s.typesP || ''}\n${(s.types || []).map(t => `- ${t.title}: ${t.desc}`).join('\n')}`)
  add('guide', `${catName}: sizing`, `${s.sizingP1 || ''}\n${(s.sizingRows || []).map(r => Object.values(r).join(' | ')).join('\n')}`)

  for (const c of s.specCards || []) {
    add('guide', `${catName}: ${c.title}`, c.desc)
  }
  for (const b of s.brands || []) {
    add('guide', `${catName}: brand ${b.name}`, b.desc)
  }
  for (const f of s.faqs || []) {
    add('faq', `${catName} — ${f.q}`, `Q: ${f.q}\nA: ${f.a}`)
  }
  add('guide', `${catName}: installation`, s.installP)
  for (const k of s.featuredKeys || []) {
    chunks.push(new Chunk('product_link', `${catName} product`, `Featured ${catName.toLowerCase()} product key: ${k}.`))
  }
}

// ---- Product catalog ----------------------------------------------------
for (const p of catalog.products) {
  const catName = CATEGORY_NAMES[p.category] || p.category
  add('product', `${catName} product ${p.key}`, `Product key ${p.key} belongs to the ${catName} category.`)
}

// ---- Contact info -------------------------------------------------------
const c = en.contact || {}
add('contact', 'Contact', `Phone: ${c.phone || ''} | WhatsApp: ${c.whatsapp || ''} | Email: ${c.email || ''}`)

// ---- Write output -------------------------------------------------------
mkdirSync(outDir, { recursive: true })
const output = {
  generatedAt: new Date().toISOString(),
  source: 'src/i18n/locales/en.json + src/data/catalog',
  count: chunks.length,
  chunks,
}
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8')

console.log(`✓ built ${chunks.length} chunks -> ${outPath}`)