// AquaPro AI Chatbot — Cloudflare Worker
//
// Endpoint:  POST /api/chat   { message, history? }
//            GET  /health
//
// Behavior:
//   1. Embed the user's question.
//   2. Retrieve the most relevant chunks from the knowledge base.
//   3. Ask the LLM to answer using ONLY that context.
//   4. If no good match is found, reply "I don't know" — never invents info.
//
// CHAT_MODE env var:
//   - "llm"  : full RAG via Workers AI (needs Cloudflare account + keys)
//   - "mock" : offline keyword retrieval with template answers (no API needed)

import kbJson from '../kb/chunks.json' assert { type: 'json' }

const KB = kbJson.chunks || []
const EMBEDDING_MODEL = '@cf/baai/bge-large-en-v1.5'
const LLM_MODEL = '@cf/meta/llama-3.1-8b-instruct'
const EMBEDDING_DIM = 1536

const corsHeaders = (request, env) => {
  const config = (env?.ALLOWED_ORIGINS || '').split(',').map(s => s.trim())
  const origin = request?.headers?.get('Origin')
  const allowOrigin = origin && config.includes(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })
}

function textChunk(text, max = 160) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

// ---- Mock mode: offline retrieval + canned answers ---------------------
// Tokenize + stem-light matching against the knowledge base, then build a
// truthful answer by quoting the best chunks. No external API is called.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'for', 'and',
  'or', 'in', 'on', 'at', 'by', 'with', 'about', 'how', 'what', 'when',
  'where', 'which', 'who', 'why', 'do', 'does', 'did', 'i', 'you', 'we',
  'they', 'it', 'my', 'your', 'our', 'their', 'can', 'should', 'pool',
])

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
}

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
])

function hasDomainTerm(query) {
  const tokens = tokenize(query)
  return tokens.some(tok => DOMAIN_TERMS.has(tok))
}

// Precomputed term frequency maps for the knowledge base (mock mode only).
let kbDocFreq = null

function termFreq(text) {
  const tf = new Map()
  for (const tok of tokenize(text)) tf.set(tok, (tf.get(tok) || 0) + 1)
  return tf
}

function ensureDocFreq() {
  if (kbDocFreq) return kbDocFreq
  const df = new Map()
  for (const chunk of KB) {
    const seen = new Set(tokenize(chunk.title + ' ' + chunk.text))
    for (const tok of seen) df.set(tok, (df.get(tok) || 0) + 1)
  }
  kbDocFreq = { df, total: KB.length }
  return kbDocFreq
}

async function retrieveMock(query, topK = 4) {
  const MIN_SCORE = 0.5
  if (!hasDomainTerm(query)) return []

  const { df, total } = ensureDocFreq()
  const qt = tokenize(query)
  const qtf = termFreq(query)
  const seen = new Set(qt)

  const scored = KB.map((chunk, i) => {
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

  return scored.map(x => ({
    title: x.chunk.title,
    text: x.chunk.text,
    score: x.score,
    type: x.chunk.type,
  }))
}

function buildMockAnswer(query, results) {
  if (!results.length) {
    return {
      answer: "I couldn't find that in our knowledge base. Could you rephrase, or try asking about pumps, filters, heaters, lighting, disinfection, accessories or pipes & fittings? You can also contact us for help.",
      grounded: false,
    }
  }
  const parts = results.map(r => {
    const t = textChunk(r.text)
    return r.type === 'faq'
      ? `Q&A: ${r.title}\n${t}`
      : `${r.title}: ${t}`
  })
  return {
    answer: `Based on our buying guides:\n\n${parts.join('\n\n')}`,
    grounded: true,
    sources: results.map(r => r.title),
  }
}

// ---- LLM mode: real embeddings + vector retrieval + grounded answer -----
async function embedReal(env, text) {
  const { data } = await env.AI.run(EMBEDDING_MODEL, { text: [text] })
  return data[0] || new Array(EMBEDDING_DIM).fill(0)
}

async function retrieveVectorize(env, vec, topK = 4) {
  if (!env.VECTORIZE) return []
  try {
    const res = await env.VECTORIZE.query(vec, { topK, returnValues: false, returnMetadata: 'all' })
    return (res.matches || []).map(m => ({
      title: m.metadata?.title || 'Knowledge base',
      text: m.metadata?.text || '',
      type: m.metadata?.type || 'guide',
      score: m.score,
    }))
  } catch {
    return []
  }
}

function buildLlamaPrompt(query, results) {
  const context = results.length
    ? results.map((r, i) => `[${i + 1}] ${r.title}\n${r.text}`).join('\n\n')
    : '(no relevant context found)'

  return `You are the AquaPro pool equipment support assistant.
Answer the customer's question using ONLY the context below. Follow these rules strictly:
- Answer in the same language as the customer's question.
- Base the answer exclusively on the context. Do NOT add information from anywhere else.
- If the context does not contain the answer, respond with exactly: "I couldn't find that in our knowledge base. Please contact us and our experts will help."
- If the question is not about pool equipment, politely say you only answer questions about AquaPro pool equipment.
- Be concise (2-5 sentences). Use bullet points when helpful.

CONTEXT:
${context}

QUESTION: ${query}
ANSWER:`
}

async function runLlm(env, query, results) {
  const prompt = buildLlamaPrompt(query, results)
  const out = await env.AI.run(LLM_MODEL, {
    prompt,
    stream: false,
    max_tokens: 350,
    temperature: 0.2,
  })
  const answer = (out?.response || '').trim() || "I couldn't find that in our knowledge base."
  return {
    answer,
    grounded: results.length > 0,
    sources: results.map(r => r.title),
  }
}

// ---- Rate limiting (simple per-IP, KV-backed) ---------------------------
async function rateLimited(env, request) {
  if (!env.CHAT_STATE) return false
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const key = `rl:${ip}`
  const now = Date.now()
  try {
    const raw = await env.CHAT_STATE.get(key)
    let hits = raw ? JSON.parse(raw) : { count: 0, ts: now }
    if (now - hits.ts > 60000) {
      hits = { count: 0, ts: now }
    }
    hits.count += 1
    await env.CHAT_STATE.put(key, JSON.stringify(hits), { expirationTtl: 60 })
    return hits.count > 20
  } catch {
    return false
  }
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return json({ ok: true, mode: env.CHAT_MODE || 'mock', chunks: KB.length }, 200, cors)
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      if (await rateLimited(env, request)) {
        return json({ error: 'Too many messages. Please try again in a minute.' }, 429, cors)
      }

      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'Invalid JSON body.' }, 400, cors)
      }

      const query = (body.message || '').trim()
      if (!query) return json({ error: 'Missing "message".' }, 400, cors)

      const mode = (env.CHAT_MODE || 'mock').toLowerCase()

      try {
        if (mode === 'llm') {
          const qvec = await embedReal(env, query)
          const results = await retrieveVectorize(env, qvec)
          const reply = await runLlm(env, query, results)
          return json(reply, 200, cors)
        }

        // mock mode
        const results = await retrieveMock(query)
        const reply = buildMockAnswer(query, results)
        return json(reply, 200, cors)
      } catch {
        return json({ error: 'Chat service unavailable. Please try again shortly.' }, 500, cors)
      }
    }

    return json({ error: 'Not found. Use POST /api/chat.' }, 404, cors)
  },
}
