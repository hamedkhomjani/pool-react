import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  getProductsFromSupabase,
  deleteProductFromSupabase,
  toggleProductStockInSupabase,
  updateProductPriceInSupabase,
  batchUpdateStockInSupabase,
  batchDeleteProductsFromSupabase,
  seedStaticCatalogToSupabase,
  transformProductRow,
} from '../../services/catalogService'
import { importProductsFromFile, exportProducts } from '../../services/catalogFileTools'
import categories from '../../data/catalog/categories'
import ProductFormModal from './ProductFormModal'
import './Admin.css'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // 'all', 'in_stock', 'out_of_stock'
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price_asc', 'price_desc'
  const [editingProduct, setEditingProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')
  const [togglingId, setTogglingId] = useState(null)
  const fileInputRef = useRef(null)
  const [exportFormat, setExportFormat] = useState('csv') // 'csv' | 'tsv' | 'xlsx'
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')

  // Selection & Batch Actions
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState(null)
  const [tempPrice, setTempPrice] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await getProductsFromSupabase()
      if (rows && rows.length > 0) {
        setProducts(rows.map((r) => transformProductRow(r, 'fa')))
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // KPI Stats
  const stats = useMemo(() => {
    const total = products.length
    const inStock = products.filter((p) => p.inStock).length
    const outOfStock = total - inStock
    const totalCategories = new Set(products.map((p) => p.category)).size
    return { total, inStock, outOfStock, totalCategories }
  }, [products])

  const handleSeed = async () => {
    if (!window.confirm('آیا می‌خواهید داده‌های اولیه کاتالوگ در دیتابیس بارگذاری شوند؟')) return
    setSeeding(true)
    setMessage('')
    try {
      const res = await seedStaticCatalogToSupabase()
      if (res.seeded) {
        setMessage(`تعداد ${res.count} محصول اولیه با موفقیت وارد دیتابیس شد!`)
        loadData()
      } else {
        setMessage(res.message || 'داده‌ها قبلاً وارد شده‌اند.')
      }
    } catch (err) {
      setMessage('خطا در ورود داده‌ها: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  // Quick 1-click stock toggle
  const handleToggleStock = async (product) => {
    setTogglingId(product.id)
    try {
      const updatedInStock = !product.inStock
      await toggleProductStockInSupabase(product.id, updatedInStock)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedInStock } : p))
      )
    } catch (err) {
      alert('خطا در تغییر وضعیت موجودی: ' + err.message)
    } finally {
      setTogglingId(null)
    }
  }

  // Save Inline Price Edit
  const handleSavePrice = async (id) => {
    if (!tempPrice || isNaN(tempPrice)) {
      setEditingPriceId(null)
      return
    }
    try {
      await updateProductPriceInSupabase(id, Number(tempPrice))
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: Number(tempPrice) } : p))
      )
    } catch (err) {
      alert('خطا در بروزرسانی قیمت: ' + err.message)
    } finally {
      setEditingPriceId(null)
    }
  }

  // Duplicate Product
  const handleDuplicate = (product) => {
    const duplicated = {
      ...product,
      id: null,
      key: '',
      title: `${product.title} (کپی)`,
      raw: {
        ...product.raw,
        id: null,
        key: '',
        title_fa: `${product.title} (کپی)`,
        title_en: product.raw?.title_en ? `${product.raw.title_en} (Copy)` : '',
      },
    }
    setEditingProduct(duplicated)
    setShowModal(true)
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`آیا از حذف محصول "${title}" اطمینان دارید؟`)) return
    try {
      await deleteProductFromSupabase(id)
      loadData()
    } catch (err) {
      alert('خطا در حذف محصول: ' + err.message)
    }
  }

  // Selection Checkbox Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredProducts.map((p) => p.id).filter(Boolean)
      setSelectedIds(new Set(allIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  // Batch Stock Update
  const handleBatchStock = async (inStock) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await batchUpdateStockInSupabase(ids, inStock)
      setSelectedIds(new Set())
      loadData()
    } catch (err) {
      alert('خطا در تغییر وضعیت گروهی: ' + err.message)
    }
  }

  // Batch Delete
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!window.confirm(`آیا از حذف تعداد ${ids.length} محصول انتخاب‌شده اطمینان دارید؟`)) return
    try {
      await batchDeleteProductsFromSupabase(ids)
      setSelectedIds(new Set())
      loadData()
    } catch (err) {
      alert('خطا در حذف گروهی: ' + err.message)
    }
  }

  // Export Catalog to CSV / TSV / Excel File
  const handleExport = () => {
    if (products.length === 0) return
    exportProducts(products, exportFormat)
  }

  // Import products from CSV / TSV / Excel file
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImporting(true)
    setImportError('')
    setImportResult(null)
    try {
      const result = await importProductsFromFile(file)
      setImportResult(result)
      loadData()
    } catch (err) {
      setImportError(err.message || 'خطا در خواندن فایل')
    } finally {
      setImporting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.key || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = selectedCategory ? p.category === selectedCategory : true
      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'in_stock'
          ? p.inStock
          : !p.inStock
      return matchesSearch && matchesCat && matchesStock
    })

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return result
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy])

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h4>کل محصولات</h4>
            <div className="admin-stat-number">{stats.total}</div>
          </div>
          <div className="admin-stat-icon">📦</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h4>موجود در انبار</h4>
            <div className="admin-stat-number" style={{ color: '#4ade80' }}>
              {stats.inStock}
            </div>
          </div>
          <div className="admin-stat-icon green">✅</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h4>ناموجود</h4>
            <div className="admin-stat-number" style={{ color: '#f87171' }}>
              {stats.outOfStock}
            </div>
          </div>
          <div className="admin-stat-icon red">❌</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h4>تنوع دسته‌بندی‌ها</h4>
            <div className="admin-stat-number" style={{ color: '#c084fc' }}>
              {stats.totalCategories}
            </div>
          </div>
          <div className="admin-stat-icon purple">🗂️</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-title-area">
          <h1>مدیریت محصولات استخر</h1>
          <p>مشاهده، افزودن، تغییر سریع قیمت و موجودی، خروجی اکسل و مدیریت گروهی</p>
        </div>

        <div className="admin-actions">
          <div className="admin-file-tools">
            <select
              className="admin-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              title="فرمت دانلود"
            >
              <option value="csv">CSV</option>
              <option value="tsv">TSV</option>
              <option value="xlsx">Excel</option>
            </select>
            <button
              className="admin-btn-secondary"
              onClick={handleExport}
              disabled={products.length === 0}
              title="دانلود محصولات در فرمت انتخابی"
            >
              ⬇ دانلود خروجی
            </button>
          </div>

          <label
            className="admin-btn-secondary"
            style={{ cursor: importing ? 'wait' : 'pointer', background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.25)' }}
          >
            {importing ? 'در حال ورود...' : '📥 ورود از فایل'}
            <input
              type="file"
              accept=".csv,.tsv,.xlsx,.xls"
              onChange={handleImportFile}
              disabled={importing}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </label>

          {products.length === 0 && (
            <button
              className="admin-btn-secondary"
              onClick={handleSeed}
              disabled={seeding}
              style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
            >
              {seeding ? 'در حال ورود داده‌ها...' : '📥 بارگذاری محصولات اولیه کاتالوگ'}
            </button>
          )}

          <button
            className="admin-btn-primary"
            onClick={() => {
              setEditingProduct(null)
              setShowModal(true)
            }}
          >
            ➕ افزودن محصول جدید
          </button>
        </div>
      </div>

      {message && (
        <div
          className="admin-error-box"
          style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
        >
          {message}
        </div>
      )}

      {importError && (
        <div className="admin-error-box">{importError}</div>
      )}

      {importResult && (
        <div
          className="admin-error-box"
          style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}
        >
          {importResult.total} سطر خوانده شد — {importResult.added} محصول جدید ایجاد و{' '}
          {importResult.updated} محصول به‌روزرسانی شد.
          {importResult.failed.length > 0 && (
            <>
              <br />
              <span style={{ color: '#f87171' }}>
                {importResult.failed.length} سطر ناموفق (ردیف‌های{' '}
                {importResult.failed.map((f) => f.row).join('، ')}:{' '}
                {importResult.failed.map((f) => f.reason).join('؛ ')})
              </span>
            </>
          )}
        </div>
      )}

      {/* Batch Action Bar (Appears when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="admin-batch-bar">
          <div className="admin-batch-info">
            تعداد {selectedIds.size} محصول انتخاب شده است
          </div>
          <div className="admin-batch-actions">
            <button className="admin-btn-secondary" onClick={() => handleBatchStock(true)}>
              ✅ تغییر به موجود
            </button>
            <button className="admin-btn-secondary" onClick={() => handleBatchStock(false)}>
              ❌ تغییر به ناموجود
            </button>
            <button
              className="admin-btn-logout"
              onClick={handleBatchDelete}
              style={{ padding: '0.5rem 1rem' }}
            >
              🗑️ حذف گروهی
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          {/* Stock Filter Pills */}
          <button
            className={`admin-pill-btn ${stockFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStockFilter('all')}
          >
            همه ({stats.total})
          </button>
          <button
            className={`admin-pill-btn ${stockFilter === 'in_stock' ? 'active' : ''}`}
            onClick={() => setStockFilter('in_stock')}
          >
            موجود ({stats.inStock})
          </button>
          <button
            className={`admin-pill-btn ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => setStockFilter('out_of_stock')}
          >
            ناموجود ({stats.outOfStock})
          </button>
        </div>

        <div className="admin-filter-group">
          {/* Search Input */}
          <input
            type="text"
            className="admin-input"
            style={{ maxWidth: '220px' }}
            placeholder="🔍 جستجوی محصول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Select */}
          <select
            className="admin-select"
            style={{ maxWidth: '170px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.slug}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            className="admin-select"
            style={{ maxWidth: '150px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">جدیدترین</option>
            <option value="price_asc">ارزان‌ترین</option>
            <option value="price_desc">گران‌ترین</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            در حال دریافت کاتالوگ از دیتابیس...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            {products.length === 0
              ? 'هنوز هیچ محصولی در دیتابیس ذخیره نشده است. روی دکمه "افزودن محصول جدید" یا "بارگذاری محصولات اولیه" کلیک کنید.'
              : 'هیچ محصولی با این فیلتر یافت نشد.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredProducts.length > 0 &&
                      filteredProducts.every((p) => selectedIds.has(p.id))
                    }
                  />
                </th>
                <th>تصویر</th>
                <th>نام محصول</th>
                <th>دسته‌بندی</th>
                <th>قیمت (کلیک برای ویرایش سریع)</th>
                <th>موجودی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const catObj = categories.find((c) => c.slug === p.category)
                const isToggling = togglingId === p.id
                const isEditingPrice = editingPriceId === p.id
                const isSelected = selectedIds.has(p.id)

                return (
                  <tr key={p.id || p.key} style={{ background: isSelected ? 'rgba(56, 189, 248, 0.05)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(p.id)}
                      />
                    </td>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="admin-product-thumb" />
                      ) : (
                        <div className="admin-product-thumb">{p.icon || '⚙️'}</div>
                      )}
                    </td>
                    <td>
                      <div className="admin-product-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span>{p.title}</span>
                        {p.featured && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '0.3rem',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              fontWeight: 700,
                            }}
                            title="محصول ویژه صفحه اصلی"
                          >
                            ⭐ ویژه
                          </span>
                        )}
                        {p.offerExpiresAt && new Date(p.offerExpiresAt) > new Date() && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: 'rgba(251, 191, 36, 0.15)',
                              color: '#fbbf24',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '0.3rem',
                              border: '1px solid rgba(251, 191, 36, 0.3)',
                              fontWeight: 700,
                            }}
                            title={`تایمر فروش ویژه تا: ${new Date(p.offerExpiresAt).toLocaleDateString('fa-IR')}`}
                          >
                            ⏱️ تایمر
                          </span>
                        )}
                      </div>
                      <div className="admin-product-key">کد: {p.key}</div>
                    </td>
                    <td>{catObj ? catObj.slug : p.category}</td>

                    {/* Inline Price Editor */}
                    <td>
                      {isEditingPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="number"
                            className="admin-inline-price-input"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePrice(p.id)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleSavePrice(p.id)}
                            style={{ padding: '0.2rem 0.5rem', background: '#22c55e', color: '#fff' }}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          className="admin-price-display"
                          onClick={() => {
                            if (p.id) {
                              setEditingPriceId(p.id)
                              setTempPrice(String(p.price))
                            }
                          }}
                          title="برای ویرایش سریع قیمت کلیک کنید"
                        >
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>{formatPrice(p.price)}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>✏️</span>
                        </div>
                      )}
                    </td>

                    {/* Quick Stock Toggle */}
                    <td>
                      <button
                        className="admin-stock-toggle"
                        onClick={() => handleToggleStock(p)}
                        disabled={isToggling || !p.id}
                        title="جهت تغییر سریع وضعیت موجودی کلیک کنید"
                      >
                        <span className={`admin-badge-stock ${p.inStock ? 'available' : 'unavailable'}`}>
                          {isToggling ? '...' : p.inStock ? 'موجود ✅' : 'ناموجود ❌'}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => {
                            setEditingProduct(p)
                            setShowModal(true)
                          }}
                          title="ویرایش کامل محصول"
                        >
                          ✏️ ویرایش
                        </button>
                        <button
                          className="admin-btn-icon duplicate"
                          onClick={() => handleDuplicate(p)}
                          title="کپی کردن مشخصات این محصول"
                        >
                          📋 کپی
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(p.id, p.title)}
                          title="حذف محصول"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}
    </div>
  )
}
