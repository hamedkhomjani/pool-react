// End-to-end test of the Worker's fetch handler (mock mode).
// Runs the real src/index.js against Node's built-in Request/Response.
import worker from '../src/index.js'

const env = { CHAT_MODE: 'mock', ALLOWED_ORIGINS: 'https://aquapro.ir' }

function chatRequest(message, origin) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify({ message }),
  })
}

const tests = [
  ['how often should I backwash?', true],
  ['what heater do I need?', true],
  ['do you sell UV systems?', true],
  ['بهترین پمپ برای استخر چیست؟', true], // Persian
  ['tell me a joke', false],
  ['what is the meaning of life?', false],
]

let pass = 0
for (const [q, exp] of tests) {
  const res = await worker.fetch(chatRequest(q), env)
  const data = await res.json()
  const ok = res.status === 200 && data.grounded === exp && !data.error
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${q} | status=${res.status} grounded=${data.grounded} src=${(data.sources || [])[0] || '-'}`)
}

// health endpoint
{
  const res = await worker.fetch(new Request('http://localhost/health'), env)
  const data = await res.json()
  const ok = res.status === 200 && data.ok && data.mode === 'mock' && data.chunks > 0
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | GET /health | ${JSON.stringify(data)}`)
}

// CORS allowlist
{
  const res = await worker.fetch(chatRequest('pump', 'https://aquapro.ir'), env)
  const allow = res.headers.get('Access-Control-Allow-Origin')
  const ok = allow === 'https://aquapro.ir'
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | CORS allowed origin echoed | ${allow}`)
}
{
  const res = await worker.fetch(chatRequest('pump', 'https://evil.example'), env)
  const allow = res.headers.get('Access-Control-Allow-Origin')
  console.log(`INFO | CORS unknown origin -> ${allow}`)
}

// empty message rejected
{
  const res = await worker.fetch(chatRequest('   '), env)
  const ok = res.status === 400
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | empty message -> ${res.status}`)
}

console.log(`${pass}/${tests.length + 3} passed`)
if (pass < tests.length + 3) process.exit(1)
