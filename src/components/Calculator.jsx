import { useState } from 'react'

const shapes = [
  { value: 'rect', label: 'مستطیلی', icon: '▬' },
  { value: 'circ', label: 'دایره‌ای', icon: '●' },
  { value: 'oval', label: 'بیضی', icon: '⬮' },
  { value: 'custom', label: 'سفارشی', icon: '✏️' },
]

function calcVolume(shape, dims) {
  const d = Number(dims.depth)
  if (shape === 'rect') {
    const l = Number(dims.length)
    const w = Number(dims.width)
    return l * w * d
  }
  if (shape === 'circ') {
    const r = Number(dims.diameter) / 2
    return Math.PI * r * r * d
  }
  if (shape === 'oval') {
    const l = Number(dims.length) / 2
    const w = Number(dims.width) / 2
    return Math.PI * l * w * d
  }
  if (shape === 'custom') {
    return Number(dims.volume)
  }
  return 0
}

function recommend(volume) {
  let pump
  if (volume <= 30) pump = { power: '0.5 HP', flow: '8 m³/h', model: 'HW-0500' }
  else if (volume <= 50) pump = { power: '0.75 HP', flow: '12 m³/h', model: 'HW-0750' }
  else if (volume <= 80) pump = { power: '1 HP', flow: '16 m³/h', model: 'HW-1000' }
  else if (volume <= 120) pump = { power: '1.5 HP', flow: '21 m³/h', model: 'HW-1500' }
  else if (volume <= 200) pump = { power: '2 HP', flow: '28 m³/h', model: 'HW-2000' }
  else pump = { power: '3 HP', flow: '35 m³/h', model: 'HW-3000' }

  let filter
  if (volume <= 40) filter = { diameter: '50 cm', flow: '10 m³/h', model: 'MEGA-500' }
  else if (volume <= 80) filter = { diameter: '65 cm', flow: '15 m³/h', model: 'MEGA-650' }
  else if (volume <= 150) filter = { diameter: '75 cm', flow: '22 m³/h', model: 'MEGA-750' }
  else filter = { diameter: '90 cm', flow: '30 m³/h', model: 'MEGA-900' }

  let heater
  if (volume <= 40) heater = { power: '24 kW', model: 'HT-24' }
  else if (volume <= 80) heater = { power: '36 kW', model: 'HT-36' }
  else if (volume <= 150) heater = { power: '48 kW', model: 'HT-48' }
  else heater = { power: '60 kW', model: 'HT-60' }

  let uv
  if (volume <= 40) uv = { power: '55 W', flow: '6 m³/h', model: 'UV-55P' }
  else if (volume <= 80) uv = { power: '85 W', flow: '10 m³/h', model: 'UV-85P' }
  else if (volume <= 150) uv = { power: '150 W', flow: '18 m³/h', model: 'UV-150P' }
  else uv = { power: '250 W', flow: '30 m³/h', model: 'UV-250P' }

  return { pump, filter, heater, uv }
}

function formatVolume(volume) {
  try {
    return new Intl.NumberFormat('fa').format(volume)
  } catch {
    return volume.toLocaleString()
  }
}

import Reveal from './Reveal'

function Calculator() {
  const [shape, setShape] = useState('rect')
  const [dims, setDims] = useState({ length: '', width: '', diameter: '', depth: '', volume: '' })
  const [result, setResult] = useState(null)

  function handleChange(e) {
    setDims({ ...dims, [e.target.name]: e.target.value })
  }

  function handleCalc(e) {
    e.preventDefault()
    const volume = calcVolume(shape, dims)
    if (volume <= 0) return
    const recs = recommend(volume)
    setResult({ volume: Math.round(volume * 10) / 10, ...recs })
  }

  function handleReset() {
    setResult(null)
    setDims({ length: '', width: '', diameter: '', depth: '', volume: '' })
  }

  return (
    <section className="calculator-section" id="calculator">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2>محاسبه تجهیزات استخر من</h2>
            <p>ابعاد استخر خود را وارد کنید تا بهترین تجهیزات متناسب با حجم آب به شما پیشنهاد شود</p>
          </div>
        </Reveal>
        <Reveal>
        <div className="calculator-card">
          <div className="calc-shapes">
            {shapes.map(s => (
              <button
                key={s.value}
                className={`calc-shape-btn ${shape === s.value ? 'active' : ''}`}
                onClick={() => { setShape(s.value); setResult(null) }}
              >
                <span className="calc-shape-icon">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCalc} className="calc-form">
            <div className="calc-fields">
              {shape === 'custom' ? (
                <div className="calc-field" style={{ gridColumn: '1 / -1' }}>
                  <label>حجم استخر (متر مکعب)</label>
                  <input type="number" name="volume" step="0.1" min="1" required value={dims.volume} onChange={handleChange} placeholder="مثلاً ۵۰" />
                </div>
              ) : (
                <>
                  {shape !== 'circ' && (
                    <>
                      <div className="calc-field">
                        <label>طول (متر)</label>
                        <input type="number" name="length" step="0.1" min="1" required value={dims.length} onChange={handleChange} placeholder="مثلاً ۱۰" />
                      </div>
                      <div className="calc-field">
                        <label>عرض (متر)</label>
                        <input type="number" name="width" step="0.1" min="1" required value={dims.width} onChange={handleChange} placeholder="مثلاً ۵" />
                      </div>
                    </>
                  )}
                  {shape === 'circ' && (
                    <div className="calc-field">
                      <label>قطر (متر)</label>
                      <input type="number" name="diameter" step="0.1" min="1" required value={dims.diameter} onChange={handleChange} placeholder="مثلاً ۶" />
                    </div>
                  )}
                  <div className="calc-field">
                    <label>عمق متوسط (متر)</label>
                    <input type="number" name="depth" step="0.1" min="0.5" required value={dims.depth} onChange={handleChange} placeholder="مثلاً ۱.۵" />
                  </div>
                </>
              )}
            </div>
            <div className="calc-actions">
              <button type="submit" className="btn btn-primary">محاسبه تجهیزات</button>
              {result && <button type="button" className="btn btn-outline" onClick={handleReset}>محاسبه مجدد</button>}
            </div>
          </form>

          {result && (
            <div className="calc-result">
              <div className="calc-result-header">
                <span className="calc-volume">حجم استخر: <strong>{formatVolume(result.volume)} متر مکعب</strong></span>
              </div>
              <div className="calc-rec-grid">
                <div className="calc-rec-card">
                  <div className="rec-icon">⚙️</div>
                  <h4>پمپ تصفیه</h4>
                  <div className="rec-model">{result.pump.model}</div>
                  <div className="rec-detail">توان: {result.pump.power}</div>
                  <div className="rec-detail">دبی: {result.pump.flow}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🌪️</div>
                  <h4>فیلتر شنی</h4>
                  <div className="rec-model">{result.filter.model}</div>
                  <div className="rec-detail">قطر: {result.filter.diameter}</div>
                  <div className="rec-detail">دبی: {result.filter.flow}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🔥</div>
                  <h4>مبدل حرارتی</h4>
                  <div className="rec-model">{result.heater.model}</div>
                  <div className="rec-detail">توان: {result.heater.power}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🧪</div>
                  <h4>سیستم UV</h4>
                  <div className="rec-model">{result.uv.model}</div>
                  <div className="rec-detail">توان: {result.uv.power}</div>
                  <div className="rec-detail">دبی: {result.uv.flow}</div>
                </div>
              </div>
              <p className="calc-note">پیشنهاد فوق بر اساس استانداردهای عمومی طراحی شده است. برای دریافت مشاوره تخصصی با کارشناسان ما تماس بگیرید.</p>
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="tel:+982188888888" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 36px' }}>
                  📞 تماس با کارشناسان فروش
                </a>
              </div>
            </div>
          )}
        </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Calculator
