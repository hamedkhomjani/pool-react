import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const kb = JSON.parse(readFileSync(new URL('../kb/chunks.json', import.meta.url), 'utf8')).chunks

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'for', 'and',
  'or', 'in', 'on', 'at', 'by', 'with', 'about', 'how', 'what', 'when',
  'where', 'which', 'who', 'why', 'do', 'does', 'did', 'i', 'you', 'we',
  'they', 'it', 'my', 'your', 'our', 'their', 'can', 'should', 'pool',
])
const tokenize = t => (t || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w))
const termFreq = t => { const m = new Map(); for (const tok of tokenize(t)) m.set(tok, (m.get(tok) || 0) + 1); return m }
const df = new Map()
for (const c of kb) for (const tok of new Set(tokenize(c.title + ' ' + c.text))) df.set(tok, (df.get(tok) || 0) + 1)
const total = kb.length

function retrieve(query) {
  const MIN = 0.5
  const DOMAIN_TERMS = new Set(['pump','pumps','filter','filters','heater','heaters','heating','light','lights','led','uv','salt','chlorine','sanitiser','sanitizer','disinfect','sand','glass','flow','pressure','valve','pipe','pipes','fitting','fittings','accessory','accessories','backwash','gauge','electric','solar','heat','volume','hp','kw','watt','volt','tank','skimmer','brush','ladder','cover','cable','transformer','cell','media','basket','impeller','swimming','water','pool','pools','temperature','freeze','flowrate','bar','m3','backwashing','lifespan','warranty','contact','price','buy','brand','install','repair','maintenance','green','algae','cloudy','leak'])
  if (!tokenize(query).some(tok => DOMAIN_TERMS.has(tok))) return []

  const qtf = termFreq(query)
  const seen = new Set(tokenize(query))
  return kb
    .map(c => {
      let dot = 0
      const tf = termFreq(c.title + ' ' + c.text)
      for (const tok of seen) {
        const fq = qtf.get(tok) || 0
        const fd = tf.get(tok) || 0
        if (fq && fd) { const idf = Math.log((total + 1) / ((df.get(tok) || 0) + 1)) + 1; dot += fq * idf }
      }
      return { c, dot }
    })
    .filter(x => x.dot >= MIN)
    .sort((a, b) => b.dot - a.dot)
    .slice(0, 4)
    .map(x => ({ title: x.c.title, text: x.c.text, type: x.c.type }))
}

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.url === '/health') { res.end(JSON.stringify({ ok: true })); return }
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = ''
    req.on('data', d => body += d)
    req.on('end', () => {
      const q = JSON.parse(body).message
      const r = retrieve(q)
      const answer = r.length ? `Based on our guides:\n${r.map(x => `${x.title}: ${x.text.slice(0, 120)}`).join('\n')}` : "I couldn't find that in our knowledge base."
      res.end(JSON.stringify({ answer, grounded: r.length > 0, sources: r.map(x => x.title) }))
    })
    return
  }
  res.statusCode = 404
  res.end(JSON.stringify({ error: 'nf' }))
})

const PORT = 5299
await new Promise(resolve => server.listen(PORT, resolve))
console.log('mock api ready on', PORT)

async function call(message) {
  const r = await fetch(`http://127.0.0.1:${PORT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return r.json()
}

const tests = [
  ['how often should I backwash?', true],
  ['what heater do I need?', true],
  ['what is the meaning of life?', false],
  ['do you sell UV systems?', true],
]
let pass = 0
for (const [q, exp] of tests) {
  const d = await call(q)
  const ok = d.grounded === exp
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${q} | grounded=${d.grounded}`)
}
console.log(`${pass}/${tests.length}`)
server.close()