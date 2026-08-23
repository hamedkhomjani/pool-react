import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'
import { CONTACT_CONFIG } from '../config/contact'

const shapes = [
  { value: 'rect', icon: '▬' },
  { value: 'circ', icon: '●' },
  { value: 'oval', icon: '⬮' },
  { value: 'custom', icon: '✏️' },
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

function recommendPiping(volume) {
  if (volume <= 80) return { diameter: '50 mm', model: 'PVC-50', fitting: 'FITTING-KIT-50' }
  if (volume <= 150) return { diameter: '63 mm', model: 'PVC-63', fitting: 'FITTING-KIT-63' }
  return { diameter: '75 mm', model: 'PVC-75', fitting: 'FITTING-KIT-75' }
}

function recommendChemicals(volume) {
  return {
    chlorineShock: Math.round(volume * 15),
    chlorineDaily: Math.round(volume * 3),
    algaecideStart: Math.round(volume * 10),
    algaecideWeekly: Math.round(volume * 4),
    acidDosage: Math.round(volume * 10),
  }
}

function formatVolume(volume, lang) {
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fa').format(volume)
  } catch {
    return volume.toLocaleString()
  }
}

function Calculator() {
  const { t, i18n } = useTranslation()
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
    const chems = recommendChemicals(volume)
    const piping = recommendPiping(volume)
    setResult({ volume: Math.round(volume * 10) / 10, ...recs, piping, chemicals: chems })
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
            <h2>{t('calculator.title')}</h2>
            <p>{t('calculator.subtitle')}</p>
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
                <span>{t(`calculator.shapes.${s.value}`)}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCalc} className="calc-form">
            <div className="calc-fields">
              {shape === 'custom' ? (
                <div className="calc-field" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('calculator.volumeLabel')}</label>
                  <input type="number" name="volume" step="0.1" min="1" required value={dims.volume} onChange={handleChange} placeholder={t('calculator.volumePlaceholder')} />
                </div>
              ) : (
                <>
                  {shape !== 'circ' && (
                    <>
                      <div className="calc-field">
                        <label>{t('calculator.lengthLabel')}</label>
                        <input type="number" name="length" step="0.1" min="1" required value={dims.length} onChange={handleChange} placeholder={t('calculator.lengthPlaceholder')} />
                      </div>
                      <div className="calc-field">
                        <label>{t('calculator.widthLabel')}</label>
                        <input type="number" name="width" step="0.1" min="1" required value={dims.width} onChange={handleChange} placeholder={t('calculator.widthPlaceholder')} />
                      </div>
                    </>
                  )}
                  {shape === 'circ' && (
                    <div className="calc-field">
                      <label>{t('calculator.diameterLabel')}</label>
                      <input type="number" name="diameter" step="0.1" min="1" required value={dims.diameter} onChange={handleChange} placeholder={t('calculator.diameterPlaceholder')} />
                    </div>
                  )}
                  <div className="calc-field">
                    <label>{t('calculator.depthLabel')}</label>
                    <input type="number" name="depth" step="0.1" min="0.5" required value={dims.depth} onChange={handleChange} placeholder={t('calculator.depthPlaceholder')} />
                  </div>
                </>
              )}
            </div>
            <div className="calc-actions">
              <button type="submit" className="btn btn-primary">{t('calculator.calcBtn')}</button>
              {result && <button type="button" className="btn btn-outline" onClick={handleReset}>{t('calculator.recalcBtn')}</button>}
            </div>
          </form>

          {result && (
            <div className="calc-result">
              <div className="calc-result-header">
                <span className="calc-volume" dangerouslySetInnerHTML={{ __html: t('calculator.resultVolume', { volume: formatVolume(result.volume, i18n.language) }) }} />
              </div>
              <div className="calc-rec-grid">
                <div className="calc-rec-card">
                  <div className="rec-icon">⚙️</div>
                  <h4>{t('calculator.pumpCard')}</h4>
                  <div className="rec-model">{result.pump.model}</div>
                  <div className="rec-detail">{t('calculator.powerDetail', { value: result.pump.power })}</div>
                  <div className="rec-detail">{t('calculator.flowDetail', { value: result.pump.flow })}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🌪️</div>
                  <h4>{t('calculator.filterCard')}</h4>
                  <div className="rec-model">{result.filter.model}</div>
                  <div className="rec-detail">{t('calculator.diameterDetail', { value: result.filter.diameter })}</div>
                  <div className="rec-detail">{t('calculator.flowDetail', { value: result.filter.flow })}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🔥</div>
                  <h4>{t('calculator.heaterCard')}</h4>
                  <div className="rec-model">{result.heater.model}</div>
                  <div className="rec-detail">{t('calculator.powerDetail', { value: result.heater.power })}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🧪</div>
                  <h4>{t('calculator.uvCard')}</h4>
                  <div className="rec-model">{result.uv.model}</div>
                  <div className="rec-detail">{t('calculator.powerDetail', { value: result.uv.power })}</div>
                  <div className="rec-detail">{t('calculator.flowDetail', { value: result.uv.flow })}</div>
                </div>
                <div className="calc-rec-card">
                  <div className="rec-icon">🔧</div>
                  <h4>{t('calculator.pipingCard')}</h4>
                  <div className="rec-model">{result.piping.model}</div>
                  <div className="rec-detail">{t('calculator.diameterDetail', { value: result.piping.diameter })}</div>
                  <div className="rec-detail">{t('calculator.fittingDetail', { value: result.piping.fitting })}</div>
                </div>
              </div>
              <p className="calc-note">{t('calculator.note')}</p>

              {/* --- Chemical Dosage Section --- */}
              <div className="calc-chem-section">
                <div className="calc-chem-header">
                  <h3>🧪 {t('calculator.chemTitle')}</h3>
                  <p>{t('calculator.chemSubtitle')}</p>
                </div>
                <div className="calc-chem-grid">
                  <div className="calc-chem-card">
                    <div className="chem-icon">💧</div>
                    <h4>{t('calculator.chlorineShock')}</h4>
                    <div className="chem-value">{formatVolume(result.chemicals.chlorineShock, i18n.language)} <span>{t('calculator.grams')}</span></div>
                    <p className="chem-desc">{t('calculator.chlorineShockDesc')}</p>
                  </div>
                  <div className="calc-chem-card">
                    <div className="chem-icon">🩵</div>
                    <h4>{t('calculator.chlorineDaily')}</h4>
                    <div className="chem-value">{formatVolume(result.chemicals.chlorineDaily, i18n.language)} <span>{t('calculator.grams')}</span></div>
                    <p className="chem-desc">{t('calculator.chlorineDailyDesc')}</p>
                  </div>
                  <div className="calc-chem-card">
                    <div className="chem-icon">🌿</div>
                    <h4>{t('calculator.algaecideStart')}</h4>
                    <div className="chem-value">{formatVolume(result.chemicals.algaecideStart, i18n.language)} <span>{t('calculator.milliliters')}</span></div>
                    <p className="chem-desc">{t('calculator.algaecideStartDesc')}</p>
                  </div>
                  <div className="calc-chem-card">
                    <div className="chem-icon">🍃</div>
                    <h4>{t('calculator.algaecideWeekly')}</h4>
                    <div className="chem-value">{formatVolume(result.chemicals.algaecideWeekly, i18n.language)} <span>{t('calculator.milliliters')}</span></div>
                    <p className="chem-desc">{t('calculator.algaecideWeeklyDesc')}</p>
                  </div>
                  <div className="calc-chem-card calc-chem-card-wide">
                    <div className="chem-icon">⚗️</div>
                    <h4>{t('calculator.acidDosage')}</h4>
                    <div className="chem-value">{formatVolume(result.chemicals.acidDosage, i18n.language)} <span>{t('calculator.grams')}</span></div>
                    <p className="chem-desc">{t('calculator.acidDosageDesc')}</p>
                  </div>
                </div>
                <p className="calc-note">{t('calculator.chemNote')}</p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href={CONTACT_CONFIG.phoneHref} className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 36px' }}>
                  {t('calculator.ctaCall')}
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
