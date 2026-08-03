import kbJson from '../kb/chunks.json' with { type: 'json' }

const KB = kbJson.chunks

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'for', 'and',
  'or', 'in', 'on', 'at', 'by', 'with', 'about', 'how', 'what', 'when',
  'where', 'which', 'who', 'why', 'do', 'does', 'did', 'i', 'you', 'we',
  'they', 'it', 'my', 'your', 'our', 'their', 'can', 'should', 'pool',
])

const tokenize = t => (t || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w))

function termFreq(text) {
  const tf = new Map()
  for (const tok of tokenize(text)) tf.set(tok, (tf.get(tok) || 0) + 1)
  return tf
}

const df = new Map()
for (const chunk of KB) {
  for (const tok of new Set(tokenize(chunk.title + ' ' + chunk.text))) df.set(tok, (df.get(tok) || 0) + 1)
}
const total = KB.length

function retrieve(query, topK = 4) {
  const MIN_SCORE = 0.5
  const DOMAIN_TERMS = new Set(['pump','pumps','filter','filters','heater','heaters','heating','light','lights','led','uv','salt','chlorine','sanitiser','sanitizer','disinfect','sand','glass','flow','pressure','valve','pipe','pipes','fitting','fittings','accessory','accessories','backwash','gauge','electric','solar','heat','volume','hp','kw','watt','volt','tank','skimmer','brush','ladder','cover','cable','transformer','cell','media','basket','impeller','swimming','water','pool','pools','temperature','freeze','flowrate','bar','m3','backwashing','lifespan','warranty','contact','price','buy','brand','install','repair','maintenance','green','algae','cloudy','leak'])
  if (!tokenize(query).some(tok => DOMAIN_TERMS.has(tok))) return []

  const qtf = termFreq(query)
  const seen = new Set(tokenize(query))
  return KB
    .map((chunk, i) => {
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
      return { chunk, i, score: dot }
    })
    .filter(x => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => ({ title: x.chunk.title, text: x.chunk.text, score: x.score, type: x.chunk.type }))
}

function buildMockAnswer(query, results) {
  if (!results.length) {
    return { answer: "I couldn't find that in our knowledge base.", grounded: false }
  }
  const parts = results.map(r => {
    const t = r.text.length > 160 ? `${r.text.slice(0, 160)}...` : r.text
    return r.type === 'faq' ? `Q&A: ${r.title}\n${t}` : `${r.title}: ${t}`
  })
  return { answer: `Based on our buying guides:\n\n${parts.join('\n\n')}`, grounded: true, sources: results.map(r => r.title) }
}

const tests = [
  ['how often should I backwash?', true],
  ['best pump for 50m3 pool?', true],
  ['what is the meaning of life?', false],
  ['do you do installations?', false],
  ['what heater do I need?', true],
  ['how to contact support', true],
  ['should the filter be bigger than the pump?', true],
  ['tell me a joke', false],
  ['do you sell UV systems?', true],
]

let pass = 0
for (const [q, exp] of tests) {
  const r = retrieve(q)
  const a = buildMockAnswer(q, r)
  const ok = a.grounded === exp
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | Q: ${q} | grounded: ${a.grounded} | src: ${(a.sources || []).slice(0, 2).join(', ') || '-'}`)
}
console.log(`${pass}/${tests.length} passed`)