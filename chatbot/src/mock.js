// Shared mock-mode retrieval logic (offline keyword search over the KB).
// Used by both the Worker (src/index.js) and the offline tests
// (scripts/test-mock.mjs) so they can never drift apart.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'for', 'and',
  'or', 'in', 'on', 'at', 'by', 'with', 'about', 'how', 'what', 'when',
  'where', 'which', 'who', 'why', 'do', 'does', 'did', 'i', 'you', 'we',
  'they', 'it', 'my', 'your', 'our', 'their', 'can', 'should', 'pool',
])

const PERSIAN_STOPWORDS = new Set([
  'را', 'از', 'با', 'این', 'که', 'برای', 'چه', 'چیست', 'هست', 'است',
  'می', 'به', 'در', 'و', 'یا', 'من', 'شما', 'یک', 'دارد', 'شود',
])

// Persian → English glossary so Persian questions can match the
// English-language knowledge base in mock mode.
const FA_EN = new Map(Object.entries({
  'پمپ': 'pump',
  'فیلتر': 'filter',
  'تصفیه': 'filter',
  'بخاری': 'heater',
  'گرمکن': 'heater',
  'هیتر': 'heater',
  'آبگرمکن': 'heater',
  'چراغ': 'light',
  'لامپ': 'light',
  'روشنایی': 'light',
  'کلر': 'chlorine',
  'نمک': 'salt',
  'استخر': 'pool',
  'آب': 'water',
  'دبی': 'flow',
  'جریان': 'flow',
  'گردش': 'flow',
  'فشار': 'pressure',
  'لوله': 'pipe',
  'اتصال': 'fitting',
  'اتصالات': 'fittings',
  'موتور': 'motor',
  'توان': 'power',
  'وات': 'watt',
  'کیلووات': 'kw',
  'ولت': 'volt',
  'گارانتی': 'warranty',
  'ضمانت': 'warranty',
  'قیمت': 'price',
  'خرید': 'buy',
  'نصب': 'install',
  'تعمیر': 'repair',
  'سرویس': 'maintenance',
  'نگهداری': 'maintenance',
  'جلبک': 'algae',
  'سبز': 'green',
  'کدر': 'cloudy',
  'نشتی': 'leak',
  'شن': 'sand',
  'شیر': 'valve',
  'مخزن': 'tank',
  'اسکیمر': 'skimmer',
  'نردبان': 'ladder',
  'پوشش': 'cover',
  'ترانس': 'transformer',
  'سلول': 'cell',
  'سبد': 'basket',
  'پروانه': 'impeller',
  'شنا': 'swimming',
  'دما': 'temperature',
  'گرم': 'heat',
  'یخ': 'freeze',
  'عمر': 'lifespan',
  'تماس': 'contact',
  'برند': 'brand',
  'برق': 'electric',
  'خورشیدی': 'solar',
  'عفونی': 'disinfect',
}))

// Terms that strongly indicate a pool-equipment question. If a query contains
// none of these, the mock mode refuses to answer (avoids false positives on
// generic words like "life" or "meaning").
const DOMAIN_TERMS = new Set([
  'pump', 'pumps', 'filter', 'filters', 'heater', 'heaters', 'heating',
  'light', 'lights', 'led', 'uv', 'salt', 'chlorine', 'sanitiser', 'sanitizer',
  'disinfect', 'sand', 'glass', 'flow', 'pressure', 'valve', 'pipe', 'pipes',
  'fitting', 'fittings', 'accessory', 'accessories', 'backwash', 'gauge',
  'electric', 'solar', 'heat', 'volume', 'hp', 'kw', 'watt', 'volt', 'tank',
  'skimmer', 'brush', 'ladder', 'cover', 'cable', 'transformer', 'cell',
  'media', 'basket', 'impeller', 'swimming', 'water', 'pool', 'pools',
  'temperature', 'freeze', 'flowrate', 'bar', 'm3', 'backwashing',
  'lifespan', 'warranty', 'contact', 'price', 'buy', 'brand', 'install',
  'repair', 'maintenance', 'green', 'algae', 'cloudy', 'leak',
  'motor', 'power',
])

function normalizePersian(text) {
  return String(text || '')
    .replace(/\u200c/g, ' ')
    .replace(/[يك]/g, ch => (ch === 'ك' ? 'ک' : 'ی'))
}

function tokenize(text) {
  const mapped = []
  for (const tok of normalizePersian(text).toLowerCase().split(/[\s\p{P}]+/u)) {
    if (tok.length < 2 || STOPWORDS.has(tok) || PERSIAN_STOPWORDS.has(tok)) continue
    mapped.push(FA_EN.get(tok) ?? tok)
  }
  return mapped
}

function hasDomainTerm(query) {
  return tokenize(query).some(tok => DOMAIN_TERMS.has(tok))
}

function termFreq(text) {
  const tf = new Map()
  for (const tok of tokenize(text)) tf.set(tok, (tf.get(tok) || 0) + 1)
  return tf
}

export function createMockRetriever(KB, { MIN_SCORE = 0.5 } = {}) {
  // Precomputed document frequencies for the knowledge base.
  const df = new Map()
  for (const chunk of KB) {
    for (const tok of new Set(tokenize(chunk.title + ' ' + chunk.text))) {
      df.set(tok, (df.get(tok) || 0) + 1)
    }
  }
  const total = KB.length

  function retrieve(query, topK = 4) {
    if (!hasDomainTerm(query)) return []

    const qtf = termFreq(query)
    const seen = new Set(tokenize(query))

    return KB
      .map(chunk => {
        let dot = 0
        const tf = termFreq(chunk.title + ' ' + chunk.text)
        for (const tok of seen) {
          const fq = qtf.get(tok) || 0
          const fd = tf.get(tok) || 0
          if (fq && fd) {
            const idf = Math.log((total + 1) / ((df.get(tok) || 0) + 1)) + 1
            dot += fq * idf
          }
        }
        return { chunk, score: dot }
      })
      .filter(x => x.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(x => ({
        title: x.chunk.title,
        text: x.chunk.text,
        score: x.score,
        type: x.chunk.type,
      }))
  }

  return retrieve
}

export function buildMockAnswer(results) {
  if (!results.length) {
    return {
      answer: "I couldn't find that in our knowledge base. Could you rephrase, or try asking about pumps, filters, heaters, lighting, disinfection, accessories or pipes & fittings? You can also contact us for help.",
      grounded: false,
    }
  }
  const parts = results.map(r => {
    const text = textChunk(r.text)
    return r.type === 'faq'
      ? `Q&A: ${r.title}\n${text}`
      : `${r.title}: ${text}`
  })
  return {
    answer: `Based on our buying guides:\n\n${parts.join('\n\n')}`,
    grounded: true,
    sources: results.map(r => r.title),
  }
}

export { hasDomainTerm, tokenize }

function textChunk(text, max = 160) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}
