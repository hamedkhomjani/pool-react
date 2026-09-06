// Build-time prerenderer: renders every route (fa + /en mirrors) to static
// HTML with real content and per-page meta tags baked in.
//
// Usage: run AFTER `vite build` (the client bundle must exist in dist/):
//   vite build && node scripts/prerender.mjs
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import products from '../src/data/catalog/products.base.js'
import { categories } from '../src/data/catalog/categories.js'
import { brands } from '../src/data/catalog/brands.js'
import { SITE_URL } from '../src/config/site.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SSR_OUT = path.join(ROOT, '.prerender')

const STATIC_PATHS = ['/', '/about/', '/contact/', '/guides/', '/pool-pump-guide/', '/compare/', '/checkout/']

// The pump guide has its own dedicated page (/pool-pump-guide); other
// departments get /guide/<slug>. /guide/pump is a legacy SPA redirect.
// Guides are authored per department (top-level), so subcategories are excluded.
const GUIDE_SLUGS = categories
  .map(c => c.slug)
  .filter(s => s !== 'pump' && !categories.find(c => c.slug === s).parentId)

function allPaths(lang) {
  const prefix = lang === 'en' ? '/en' : ''
  return [
    ...STATIC_PATHS.map(p => prefix + p),
    ...categories.map(c => `${prefix}/category/${c.slug}/`),
    ...products.map(p => `${prefix}/product/${p.key}/`),
    ...brands.map(b => `${prefix}/brand/${b.slug}/`),
    ...GUIDE_SLUGS.map(c => `${prefix}/guide/${c}/`),
  ]
}

async function buildSsrBundle() {
  await build({
    configFile: false,
    root: ROOT,
    plugins: [react()],
    logLevel: 'warn',
    build: {
      ssr: path.join(ROOT, 'src/ssr/entry.jsx'),
      outDir: SSR_OUT,
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        output: { format: 'es' },
      },
    },
  })
  const files = fs.readdirSync(SSR_OUT).filter(f => f.endsWith('.js'))
  if (files.length !== 1) throw new Error(`unexpected ssr output: ${files}`)
  return path.join(SSR_OUT, files[0])
}

// Tags we manage; the template's static defaults are stripped so each page
// gets exactly one set.
function stripManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>\n?/g, '')
    .replace(/<meta property="og:[^"]*"[^>]*>\n?/g, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>\n?/g, '')
    .replace(/<link rel="canonical"[^>]*>\n?/g, '')
    .replace(/<link rel="alternate"[^>]*hreflang[^>]*>\n?/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
}

function metaTags(meta) {
  const lines = [`    <title>${meta.title}</title>`]
  for (const { name, property, content } of meta.metas) {
    const attr = name ? 'name' : 'property'
    lines.push(
      `    <meta ${attr}="${name || property}" content="${escapeHtml(content)}" />`,
    )
  }
  for (const link of meta.links) {
    const hreflang = link.hreflang ? ` hreflang="${link.hreflang}"` : ''
    lines.push(
      `    <link rel="${link.rel}"${hreflang} href="${link.href}" />`,
    )
  }
  if (meta.jsonLd) {
    lines.push(
      `    <script type="application/ld+json">${meta.jsonLd}</script>`,
    )
  }
  return lines.join('\n')
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function renderPage(template, url, { html, meta }) {
  if (!meta) throw new Error(`no meta collected for ${url}`)
  let out = stripManagedHead(template)
  out = out.replace(/<html([^>]*)>/, (_m, attrs) => {
    const cleaned = attrs
      .replace(/\s(lang|dir)="[^"]*"/g, '')
      .trimEnd()
    return `<html${cleaned} lang="${meta.lang}" dir="${meta.dir}">`
  })
  out = out.replace('</head>', `${metaTags(meta)}\n  </head>`)
  out = out.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${html}</div>`,
  )
  return out
}

function writePage(url, html) {
  // '/' -> dist/index.html ; '/about/' -> dist/about/index.html
  // '/en' -> dist/en/index.html ; '/en/about/' -> dist/en/about/index.html
  const rel = url.replace(/^\//, '').replace(/\/$/, '')
  const dir = rel ? path.join(DIST, rel) : DIST
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}

function sitemap() {
  const urls = allPaths('fa')
  const esc = s => s.replace(/&/g, '&amp;')
  const entry = faPath => {
    const enPath = `/en${faPath}`
    const alt = (hreflang, href) =>
      `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${esc(SITE_URL + href)}" />`
    return [
      `  <url>`,
      `    <loc>${esc(SITE_URL + faPath)}</loc>`,
      alt('fa', faPath),
      alt('en', enPath),
      alt('x-default', faPath),
      `  </url>`,
    ].join('\n')
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(entry).join('\n')}
</urlset>
`
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html missing — run `vite build` first')
  }

  process.stdout.write('building ssr bundle…\n')
  const ssrEntry = await buildSsrBundle()
  const { render } = await import(pathToFileURL(ssrEntry).href)

  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
  let count = 0
  for (const lang of ['fa', 'en']) {
    for (const url of allPaths(lang)) {
      const rendered = await render(url)
      writePage(url, renderPage(template, url, rendered))
      count++
    }
  }

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap())
  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  )

  process.stdout.write(`prerendered ${count} pages → dist/\n`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
