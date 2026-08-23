import kbJson from '../kb/chunks.json' with { type: 'json' }
import { createMockRetriever, buildMockAnswer } from '../src/mock.js'

const retrieve = createMockRetriever(kbJson.chunks)

// [query, expectedGrounded]
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
  // Persian queries (mock mode maps fa terms -> en KB tokens)
  ['بهترین پمپ برای استخر ۵۰ متر مکعب چیست؟', true],
  ['فیلتر استخر چند وقت یک بار باید شسته شود؟', true],
  ['چه بخاری برای استخر من نیاز دارم؟', true],
  ['کلر و نمک برای ضدعفونی آب استخر', true],
  ['قیمت و گارانتی محصولات شما', true],
  ['معنی زندگی چیست؟', false],
]

let pass = 0
for (const [q, exp] of tests) {
  const r = retrieve(q)
  const a = buildMockAnswer(r)
  const ok = a.grounded === exp
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} | Q: ${q} | grounded: ${a.grounded} | src: ${(a.sources || []).slice(0, 2).join(', ') || '-'}`)
}
console.log(`${pass}/${tests.length} passed`)
if (pass !== tests.length) process.exit(1)
