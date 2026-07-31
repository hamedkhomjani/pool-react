import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const shapes = [
  { value: 'rect', icon: '▬' },
  { value: 'circ', icon: '●' },
  { value: 'volume', icon: '📐' },
]

const recommendations = [
  { max: 30, hp: '0.5', hpLabel: '0.5 HP', flow: '8 m³/h', model: 'HW-0500', note: 'small' },
  { max: 50, hp: '0.75', hpLabel: '0.75 HP', flow: '12 m³/h', model: 'HW-0750', note: 'villaSmall' },
  { max: 80, hp: '1', hpLabel: '1 HP', flow: '16 m³/h', model: 'HW-1000', note: 'homeStandard' },
  { max: 120, hp: '1.5', hpLabel: '1.5 HP', flow: '21 m³/h', model: 'HW-1500', note: 'villaLarge' },
  { max: 200, hp: '2', hpLabel: '2 HP', flow: '28 m³/h', model: 'HW-2000', note: 'publicSmall' },
  { max: Infinity, hp: '3', hpLabel: '3 HP', flow: '35 m³/h', model: 'HW-3000', note: 'publicLarge' },
]

function calcVolume(shape, dims) {
  const d = Number(dims.depth)
  if (shape === 'rect') {
    return Number(dims.length) * Number(dims.width) * d
  }
  if (shape === 'circ') {
    const r = Number(dims.diameter) / 2
    return Math.PI * r * r * d
  }
  return Number(dims.volume)
}

function formatNumber(n, lang) {
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fa').format(n)
  } catch {
    return n.toLocaleString()
  }
}

function GuideSizer() {
  const { t, i18n } = useTranslation()
  const [shape, setShape] = useState('rect')
  const [dims, setDims] = useState({ length: '', width: '', diameter: '', depth: '', volume: '' })

  const result = useMemo(() => {
    const volume = calcVolume(shape, dims)
    if (!isFinite(volume) || volume <= 0) return null
    const rec = recommendations.find(r => volume <= r.max)
    return { volume: Math.round(volume * 10) / 10, ...rec }
  }, [shape, dims])

  function handleChange(e) {
    setDims({ ...dims, [e.target.name]: e.target.value })
  }

  return (
    <div className="guide-sizer" id="guide-sizer">
      <div className="guide-sizer-header">
        <span className="guide-sizer-icon">🧮</span>
        <div>
          <h3>{t('guideSizer.title')}</h3>
          <p>{t('guideSizer.subtitle')}</p>
        </div>
      </div>

      <div className="guide-sizer-shapes">
        {shapes.map(s => (
          <button
            key={s.value}
            className={`guide-sizer-shape ${shape === s.value ? 'active' : ''}`}
            onClick={() => setShape(s.value)}
            type="button"
          >
            <span className="guide-sizer-shape-icon">{s.icon}</span>
            <span>{t(`guideSizer.shapes.${s.value}`)}</span>
          </button>
        ))}
      </div>

      <div className="guide-sizer-fields">
        {shape !== 'volume' && (
          <>
            {shape === 'rect' && (
              <>
                <label className="guide-sizer-field">
                  <span>{t('guideSizer.lengthLabel')}</span>
                  <input type="number" name="length" step="0.1" min="1" value={dims.length} onChange={handleChange} placeholder={t('guideSizer.lengthPlaceholder')} />
                </label>
                <label className="guide-sizer-field">
                  <span>{t('guideSizer.widthLabel')}</span>
                  <input type="number" name="width" step="0.1" min="1" value={dims.width} onChange={handleChange} placeholder={t('guideSizer.widthPlaceholder')} />
                </label>
              </>
            )}
            {shape === 'circ' && (
              <label className="guide-sizer-field">
                <span>{t('guideSizer.diameterLabel')}</span>
                <input type="number" name="diameter" step="0.1" min="1" value={dims.diameter} onChange={handleChange} placeholder={t('guideSizer.diameterPlaceholder')} />
              </label>
            )}
            <label className="guide-sizer-field">
              <span>{t('guideSizer.depthLabel')}</span>
              <input type="number" name="depth" step="0.1" min="0.5" value={dims.depth} onChange={handleChange} placeholder={t('guideSizer.depthPlaceholder')} />
            </label>
          </>
        )}
        {shape === 'volume' && (
          <label className="guide-sizer-field guide-sizer-field-full">
            <span>{t('guideSizer.volumeLabel')}</span>
            <input type="number" name="volume" step="0.1" min="1" value={dims.volume} onChange={handleChange} placeholder={t('guideSizer.volumePlaceholder')} />
          </label>
        )}
      </div>

      {result ? (
        <div className="guide-sizer-result">
          <div className="guide-sizer-volume">
            <span dangerouslySetInnerHTML={{ __html: t('guideSizer.yourVolume', { volume: formatNumber(result.volume, i18n.language) }) }} />
          </div>
          <div className="guide-sizer-rec">
            <div className="guide-sizer-rec-main">
              <span className="guide-sizer-rec-label">{t('guideSizer.recommendedLabel')}</span>
              <span className="guide-sizer-rec-hp">{result.hpLabel}</span>
              <span className="guide-sizer-rec-model">{result.model}</span>
            </div>
            <div className="guide-sizer-rec-meta">
              <span dangerouslySetInnerHTML={{ __html: t('guideSizer.flowDetail', { flow: result.flow }) }} />
              <span>{t(`guideSizer.notes.${result.note}`)}</span>
            </div>
          </div>
          <Link to="/category/pump" className="btn btn-primary guide-sizer-cta">
            {t('guideSizer.cta')}
          </Link>
        </div>
      ) : (
        <div className="guide-sizer-empty">
          {t('guideSizer.empty')}
        </div>
      )}
    </div>
  )
}

export default GuideSizer
