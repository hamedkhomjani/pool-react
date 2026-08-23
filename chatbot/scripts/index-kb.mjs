// Indexes the knowledge base into Cloudflare Vectorize.
//
// REAL path (run once you have a Cloudflare account):
//   1. wrangler login
//   2. Set CHAT_MODE = "llm" in wrangler.toml
//   3. Create the index:
//        npx wrangler vectorize create aquapro-knowledge --dimensions=1024 --metric=cosine
//   4. Run this script with your API token:
//        CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npm run kb:index
//
// It embeds every chunk with @cf/baai/bge-m3 (multilingual, 1024 dims) and
// upserts the vectors into Vectorize. Run `npm run kb:build` first so
// chunks.json is up to date.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const kbPath = join(__dirname, '..', 'kb', 'chunks.json')

const EMBEDDING_MODEL = '@cf/baai/bge-m3'
const EMBEDDING_DIM = 1024
const INDEX_NAME = 'aquapro-knowledge'

const token = process.env.CLOUDFLARE_API_TOKEN
const account = process.env.CLOUDFLARE_ACCOUNT_ID

if (!token || !account) {
  console.log(`
Not indexing — missing Cloudflare credentials.
Set both environment variables:
  CLOUDFLARE_API_TOKEN=<your token>
  CLOUDFLARE_ACCOUNT_ID=<your account id>

Required setup first:
  - wrangler login
  - CHAT_MODE = "llm" in wrangler.toml
  - npx wrangler vectorize create ${INDEX_NAME} --dimensions=${EMBEDDING_DIM} --metric=cosine
`)
  process.exit(0)
}

const { chunks } = JSON.parse(readFileSync(kbPath, 'utf8'))
console.log(`Embedding ${chunks.length} chunks with ${EMBEDDING_MODEL} ...`)

const EMBED_URL = `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${EMBEDDING_MODEL}`

async function embed(texts) {
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  })
  if (!res.ok) throw new Error(`embedding failed: ${res.status} ${await res.text()}`)
  const { result } = await res.json()
  return result.data || []
}

const vectors = []
for (let i = 0; i < chunks.length; i += 50) {
  const batch = chunks.slice(i, i + 50)
  const data = await embed(batch.map(c => `${c.title}\n${c.text}`))
  data.forEach((vec, j) => {
    const c = batch[j]
    vectors.push({
      id: `${c.type}-${i + j}`,
      values: vec,
      metadata: {
        type: c.type,
        title: c.title,
        text: c.text,
      },
    })
  })
  console.log(`  embedded ${Math.min(i + 50, chunks.length)}/${chunks.length}`)
}

const upsertUrl = `https://api.cloudflare.com/client/v4/accounts/${account}/vectorize/v2/indexes/${INDEX_NAME}/vectors/upsert`
const upsertRes = await fetch(upsertUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ vectors }),
})

if (!upsertRes.ok) {
  throw new Error(`upsert failed: ${upsertRes.status} ${await upsertRes.text()}`)
}

const out = join(__dirname, '..', 'kb', 'indexed.json')
writeFileSync(out, JSON.stringify({ index: INDEX_NAME, count: vectors.length, dimensions: EMBEDDING_DIM }, null, 2), 'utf8')
console.log(`✓ indexed ${vectors.length} vectors into ${INDEX_NAME}`)