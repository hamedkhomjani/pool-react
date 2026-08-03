# 🤖 AquaPro AI Chatbot

A retrieval-augmented (RAG) support chatbot for the AquaPro pool equipment
website. It answers customer questions **only** from the site's own content
(guides, products, FAQs, contact info) — it never invents information.

Two modes:

| Mode | What it does | Needs account/keys? |
|------|--------------|---------------------|
| `mock` (default) | Offline keyword retrieval with strict "I don't know" fallback. Great for local dev. | ❌ No |
| `llm` | Real embeddings + LLM (Llama 3.1 8B) on Cloudflare. Precise, natural answers. | ✅ Yes |

---

## How it works

```
User QA in website ──► ChatWidget (src/components/ChatWidget.jsx)
                        │  POST /api/chat  { message }
                        ▼
                 Cloudflare Worker (src/index.js)
                        │  1. embed question → find closest knowledge chunks
                        │  2. LLM: "Answer using ONLY this context. If absent, say you don't know."
                        ▼
                    JSON reply { answer, sources }
```

The knowledge base is generated from the site's own content (not hardcoded),
so the bot always reflects the live website.

---

## Local development (no account needed)

```bash
# 1. Rebuild the knowledge base from the current site content
npm run kb:build
#   → reads src/i18n/locales/en.json + src/data/products.js
#   → writes chatbot/kb/chunks.json

# 2. Run the bot tests (mock mode, purely local)
node scripts/test-mock.mjs
```

The website chat widget is wired up already (lazy-loaded). It calls the mock
endpoint until you deploy the Worker with real credentials.

---

## Go live: connect Cloudflare (free)

1. **Create a free account** — https://dash.cloudflare.com (no credit card)
2. **Install & login**
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. **Enable Workers AI** in the dashboard: *Workers AI → Get started*
4. **Create the vector index** for the knowledge base:
   ```bash
   wrangler vectorize create aquapro-knowledge --dimensions=1536 --metric=cosine
   ```
   > The Worker uses `bge-large-en-v1.5` (1536-dim) for embeddings.
5. **Create a KV namespace** for rate limiting, copy its ID into
   `wrangler.toml` → `[kv_namespaces].id`.
6. **Switch to LLM mode** — edit `wrangler.toml`:
   ```toml
   [vars]
   CHAT_MODE = "llm"
   ALLOWED_ORIGINS = "https://aquapro.ir"   # your real domain
   ```
   Replace `https://aquapro.ir` with the domain you host the site on.
7. **Deploy**
   ```bash
   wrangler deploy
   ```
   Note the worker URL (e.g. `aquapro-ai-chatbot.<subdomain>.workers.dev`).

### Embeddings + indexing

Run `npm run kb:index` once your account is ready to embed every chunk and
upload it to Vectorize. The index script documents the exact commands.

---

## Wire the website to your deployed worker

`src/components/ChatWidget.jsx` currently calls a relative `/api/chat`. Once
you have the worker URL, either:

- **Option A — Proxy (recommended):** point your hosting (Vercel/Netlify/CF
  Pages) `/api/*` to the worker, keep the widget unchanged.
- **Option B — Direct:** set the URL in the widget:
  ```js
  const CHAT_API_URL = 'https://aquapro-ai-chatbot.<subdomain>.workers.dev/api/chat'
  ```

---

## Security & costs

- **No API key in the browser** — the worker holds all secrets server-side.
- **Rate limiting** per IP via KV (20 msgs/min).
- **CORS** restricted to `ALLOWED_ORIGINS`.
- **Grounded answers** — the prompt forces the model to answer only from
  retrieved context, and reply "I don't know" otherwise. This is the strongest
  guard against hallucination.
- **Cost:** Cloudflare free tier = 10,000 AI neurons/day, ~1,300 LLM replies
  (resets daily). Perfect for a low-traffic site. No credit card.

## Project structure

```
chatbot/
  wrangler.toml         # Cloudflare config + bindings
  package.json          # scripts: kb:build, kb:index, dev, deploy
  src/index.js          # the Worker: HTTP API + mock & LLM retrieval
  kb/                   # generated knowledge base (chunks.json)
  scripts/
    build-kb.mjs        # extract content from website -> chunks.json
    index-kb.mjs        # embed & upload to Vectorize (needs account)
    test-mock.mjs      # offline unit tests for the retrieval
    test-api.mjs       # end-to-end test via local mock server
src/components/ChatWidget.jsx   # the website's chat widget (lazy-loaded)
```