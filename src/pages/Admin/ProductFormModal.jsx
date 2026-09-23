import { useState, useEffect } from 'react'
import { saveProductToSupabase, uploadProductImage } from '../../services/catalogService'
import categories from '../../data/catalog/categories'
import brands from '../../data/catalog/brands'
import './Admin.css'

export default function ProductFormModal({ product, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    id: null,
    key: '',
    title_fa: '',
    title_en: '',
    subtitle_fa: '',
    subtitle_en: '',
    description_fa: '',
    description_en: '',
    price: '',
    compare_at: '',
    category_id: categories[0]?.slug || 'pump',
    brand_id: brands[0]?.slug || '',
    in_stock: true,
    featured: false,
    offer_expires_at: '',
    badge: '',
    image: '',
  })

  // Key Features (Line separated string)
  const [featuresText, setFeaturesText] = useState('')

  // Specs array: [{ key: 'ظرفیت', value: 'تا ۶۰ متر مکعب' }]
  const [specRows, setSpecRows] = useState([
    { key: '', value: '' }
  ])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      const raw = product.raw || {}
      
      // Parse features
      const existingFeatures = raw.features_fa || product.features || []
      const featuresStr = Array.isArray(existingFeatures) ? existingFeatures.join('\n') : ''

      // Parse specs
      const existingSpecs = raw.specs || product.specs || {}
      const parsedSpecs = Object.entries(existingSpecs).map(([k, v]) => ({ key: k, value: String(v) }))
      if (parsedSpecs.length === 0) {
        parsedSpecs.push({ key: '', value: '' })
      }

      setFormData({
        id: product.id || null,
        key: product.key || '',
        title_fa: raw.title_fa || product.title || '',
        title_en: raw.title_en || product.title || '',
        subtitle_fa: raw.subtitle_fa || product.subtitle || '',
        subtitle_en: raw.subtitle_en || product.subtitle || '',
        description_fa: raw.description_fa || product.description || product.desc || '',
        description_en: raw.description_en || product.description || product.desc || '',
        price: product.price || '',
        compare_at: product.compareAt || raw.compare_at || '',
        category_id: product.category || raw.category_id || categories[0]?.slug,
        brand_id: product.brandId || raw.brand_id || '',
        in_stock: product.inStock !== false,
        featured: raw.featured !== undefined ? Boolean(raw.featured) : Boolean(product.featured),
        offer_expires_at: raw.offer_expires_at ? raw.offer_expires_at.substring(0, 16) : (product.offerExpiresAt ? product.offerExpiresAt.substring(0, 16) : ''),
        badge: raw.badge || product.badge || '',
        image: product.image || (product.images && product.images[0]) || '',
      })

      setFeaturesText(featuresStr)
      setSpecRows(parsedSpecs)
    }
  }, [product])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const imageUrl = await uploadProductImage(file)
      setFormData((prev) => ({ ...prev, image: imageUrl }))
    } catch (err) {
      setError('خطا در آپلود عکس: ' + (err.message || 'لطفاً مجدداً لاگین فرمایید.'))
    } finally {
      setUploading(false)
    }
  }

  // Handle Specs Dynamic Rows
  const handleSpecChange = (index, field, val) => {
    const updated = [...specRows]
    updated[index][field] = val
    setSpecRows(updated)
  }

  const addSpecRow = () => {
    setSpecRows([...specRows, { key: '', value: '' }])
  }

  const removeSpecRow = (index) => {
    const updated = specRows.filter((_, i) => i !== index)
    setSpecRows(updated.length > 0 ? updated : [{ key: '', value: '' }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title_fa || !formData.price) {
      setError('لطفاً عنوان فارسی و قیمت محصول را وارد کنید.')
      return
    }

    setSaving(true)
    setError('')

    // Parse features into array
    const features_fa = featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Build specs object
    const specsObj = {}
    specRows.forEach((row) => {
      if (row.key.trim() && row.value.trim()) {
        specsObj[row.key.trim()] = row.value.trim()
      }
    })

    const payload = {
      ...formData,
      features_fa,
      specs: specsObj,
    }

    try {
      await saveProductToSupabase(payload)
      onSaved()
      onClose()
    } catch (err) {
      console.error('Save product error:', err)
      setError('خطا در ذخیره محصول: ' + (err.message || err.details || 'لطفاً لاگین مجدد فرمایید.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <h3>{formData.id ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h3>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {error && <div className="admin-error-box">{error}</div>}

          {/* Image Upload Zone */}
          <div className="admin-form-group">
            <label>تصویر اصلی محصول:</label>
            <label htmlFor="product-image-input" className="admin-upload-zone">
              {formData.image ? (
                <div>
                  <img src={formData.image} alt="Preview" className="admin-upload-preview" />
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>برای تغییر عکس کلیک کنید</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {uploading ? 'در حال آپلود...' : 'برای آپلود تصویر محصول کلیک کنید'}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                style={{ display: 'none' }}
                id="product-image-input"
              />
            </label>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label>عنوان فارسی محصول:</label>
              <input
                type="text"
                className="admin-input"
                value={formData.title_fa}
                onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                placeholder="مثال: پمپ تصفیه هایواتر ۱.۵ اسب"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>عنوان انگلیسی (English Title):</label>
              <input
                type="text"
                className="admin-input"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g. Hiwater Pool Pump 1.5HP"
                direction="ltr"
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label>قیمت فروش (تومان):</label>
              <input
                type="number"
                className="admin-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="12500000"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>قیمت قبل تخفیف (تومان - اختیاری):</label>
              <input
                type="number"
                className="admin-input"
                value={formData.compare_at}
                onChange={(e) => setFormData({ ...formData, compare_at: e.target.value })}
                placeholder="13500000"
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label>دسته‌بندی:</label>
              <select
                className="admin-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>برند سازنده:</label>
              <select
                className="admin-select"
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
              >
                <option value="">بدون برند / متفرقه</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label>وضعیت موجودی در انبار:</label>
              <select
                className="admin-select"
                value={formData.in_stock ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.value === 'true' })}
              >
                <option value="true">موجود در انبار ✅</option>
                <option value="false">ناموجود / تمام شده ❌</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>نشان / برچسب (مثال: 7% تخفیف یا پرفروش):</label>
              <input
                type="text"
                className="admin-input"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="7% تخفیف"
              />
            </div>
          </div>

          {/* Featured Product Checkbox */}
          <div
            className="admin-form-group"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              background: 'rgba(56, 189, 248, 0.08)',
              padding: '0.75rem 1rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <input
              type="checkbox"
              id="featured-checkbox"
              className="admin-checkbox"
              checked={Boolean(formData.featured)}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <label htmlFor="featured-checkbox" style={{ margin: 0, cursor: 'pointer', fontWeight: 700, color: '#38bdf8' }}>
              ⭐ نمایش در اسلایدر «پیشنهادهای ویژه» صفحه اصلی سایت (Featured Product)
            </label>
          </div>

          {/* Offer Countdown Timer */}
          {formData.featured && (
            <div
              className="admin-form-group"
              style={{
                background: 'rgba(251, 191, 36, 0.08)',
                padding: '1rem',
                borderRadius: '0.6rem',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                marginBottom: '1.25rem',
              }}
            >
              <label style={{ color: '#fbbf24', fontWeight: 700 }}>
                ⏱️ زمان پایان فروش ویژه (تایمر شمارش معکوس):
              </label>
              <input
                type="datetime-local"
                className="admin-input"
                value={formData.offer_expires_at}
                onChange={(e) => setFormData({ ...formData, offer_expires_at: e.target.value })}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                اختیاری — اگر تاریخ تنظیم شود، تایمر شمارش معکوس روی کارت محصول در صفحه اصلی نمایش داده می‌شود.
              </span>
              {formData.offer_expires_at && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, offer_expires_at: '' })}
                  style={{
                    marginTop: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.4rem',
                    padding: '0.3rem 0.8rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  ❌ حذف تایمر
                </button>
              )}
            </div>
          )}

          {/* Key Features Section */}
          <div className="admin-form-group">
            <label>ویژگی‌های کلیدی (هر ویژگی در یک خط جداگانه):</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={`موتور ۱.۵ اسب بخار با راندمان بالا\nبدنه تمام استیل ۳۰۴ ضد زنگ\nمصرف برق پایین\nمناسب استخر تا ۶۰ متر مکعب`}
            />
          </div>

          {/* Dynamic Technical Specs Editor */}
          <div className="admin-form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>مشخصات فنی (نام و مقدار):</label>
              <button
                type="button"
                onClick={addSpecRow}
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ➕ افزودن مشخصه فنی
              </button>
            </div>

            {specRows.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="عنوان (مثال: ظرفیت)"
                  value={row.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="مقدار (مثال: تا ۶۰ متر مکعب)"
                  value={row.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(idx)}
                  className="admin-btn-icon delete"
                  style={{ padding: '0 0.6rem' }}
                  title="حذف این سطر"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Full Description */}
          <div className="admin-form-group">
            <label>توضیحات کامل محصول (فارسی):</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={formData.description_fa}
              onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
              placeholder="توضیحات کاربردی و کامل محصول برای مشتریان..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="admin-btn-primary" disabled={saving || uploading}>
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
