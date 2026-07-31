import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const shapes = [
  { value: 'rect', label: 'مستطیلی', icon: '▬' },
  { value: 'circ', label: 'دایره‌ای', icon: '●' },
  { value: 'volume', label: 'حجم مستقیم', icon: '📐' },
]

const recommendations = [
  { max: 30, hp: '0.5', hpLabel: '۰.۵ اسب', flow: '8 m³/h', model: 'HW-0500', note: 'استخرهای کوچک و پلاستیکی' },
  { max: 50, hp: '0.75', hpLabel: '۰.۷۵ اسب', flow: '12 m³/h', model: 'HW-0750', note: 'استخرهای ویلایی کوچک' },
  { max: 80, hp: '1', hpLabel: '۱ اسب', flow: '16 m³/h', model: 'HW-1000', note: 'استخرهای خانگی استاندارد' },
  { max: 120, hp: '1.5', hpLabel: '۱.۵ اسب', flow: '21 m³/h', model: 'HW-1500', note: 'استخرهای بزرگ ویلایی' },
  { max: 200, hp: '2', hpLabel: '۲ اسب', flow: '28 m³/h', model: 'HW-2000', note: 'استخرهای عمومی کوچک' },
  { max: Infinity, hp: '3', hpLabel: '۳ اسب', flow: '35 m³/h', model: 'HW-3000', note: 'استخرهای عمومی بزرگ' },
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

function formatNumber(n) {
  try {
    return new Intl.NumberFormat('fa').format(n)
  } catch {
    return n.toLocaleString()
  }
}

function GuideSizer() {
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
          <h3>محاسبه‌گر فوری توان پمپ استخر</h3>
          <p>ابعاد استخر را وارد کنید؛ پیشنهاد پمپ به‌صورت زنده نمایش داده می‌شود.</p>
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
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="guide-sizer-fields">
        {shape !== 'volume' && (
          <>
            {shape === 'rect' && (
              <>
                <label className="guide-sizer-field">
                  <span>طول (متر)</span>
                  <input type="number" name="length" step="0.1" min="1" value={dims.length} onChange={handleChange} placeholder="مثلاً ۱۰" />
                </label>
                <label className="guide-sizer-field">
                  <span>عرض (متر)</span>
                  <input type="number" name="width" step="0.1" min="1" value={dims.width} onChange={handleChange} placeholder="مثلاً ۵" />
                </label>
              </>
            )}
            {shape === 'circ' && (
              <label className="guide-sizer-field">
                <span>قطر (متر)</span>
                <input type="number" name="diameter" step="0.1" min="1" value={dims.diameter} onChange={handleChange} placeholder="مثلاً ۶" />
              </label>
            )}
            <label className="guide-sizer-field">
              <span>عمق متوسط (متر)</span>
              <input type="number" name="depth" step="0.1" min="0.5" value={dims.depth} onChange={handleChange} placeholder="مثلاً ۱.۵" />
            </label>
          </>
        )}
        {shape === 'volume' && (
          <label className="guide-sizer-field guide-sizer-field-full">
            <span>حجم استخر (متر مکعب)</span>
            <input type="number" name="volume" step="0.1" min="1" value={dims.volume} onChange={handleChange} placeholder="مثلاً ۵۰" />
          </label>
        )}
      </div>

      {result ? (
        <div className="guide-sizer-result">
          <div className="guide-sizer-volume">
            حجم استخر شما: <strong>{formatNumber(result.volume)} متر مکعب</strong>
          </div>
          <div className="guide-sizer-rec">
            <div className="guide-sizer-rec-main">
              <span className="guide-sizer-rec-label">پمپ پیشنهادی</span>
              <span className="guide-sizer-rec-hp">{result.hpLabel}</span>
              <span className="guide-sizer-rec-model">{result.model}</span>
            </div>
            <div className="guide-sizer-rec-meta">
              <span>دبی: <strong>{result.flow}</strong></span>
              <span>{result.note}</span>
            </div>
          </div>
          <Link to="/category/pump" className="btn btn-primary guide-sizer-cta">
            مشاهده پمپ‌های موجود در این رنج
          </Link>
        </div>
      ) : (
        <div className="guide-sizer-empty">
          برای مشاهده‌ی پیشنهاد، ابعاد استخر را وارد کنید.
        </div>
      )}
    </div>
  )
}

export default GuideSizer
