import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../config/supabase'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminTeam() {
  const [admins, setAdmins] = useState([])
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('admin_users').select('email')
      setAdmins((data || []).map((r) => r.email))
    } catch (err) {
      setError('خطا در دریافت فهرست مدیران: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdmins()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentEmail(session.user.email || '')
    })
  }, [loadAdmins])

  const handleAdd = async (e) => {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!emailRegex.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید.')
      return
    }
    if (admins.includes(email)) {
      setError('این ایمیل از قبل در فهرست مدیران است.')
      return
    }

    setError('')
    setMessage('')
    setSaving(true)
    try {
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ email })
      if (insertError) throw insertError
      setNewEmail('')
      setMessage('مدیر جدید با موفقیت اضافه شد. (حساب ورود او باید در Authentication > Users ساخته شده باشد)')
      loadAdmins()
    } catch (err) {
      setError('خطا در افزودن مدیر: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (email) => {
    if (!window.confirm(`آیا «${email}» را از فهرست مدیران حذف کنیم؟`)) return
    setError('')
    setMessage('')
    try {
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email)
      if (deleteError) throw deleteError
      setMessage('مدیر با موفقیت حذف شد.')
      loadAdmins()
    } catch (err) {
      setError('خطا در حذف مدیر: ' + err.message)
    }
  }

  return (
    <div className="admin-table-card">
      <div className="admin-toolbar">
        <div className="admin-title-area">
          <h1>👥 تیم مدیران</h1>
          <p>فقط این ایمیل‌ها اجازه ورود و ویرایش محصولات را دارند</p>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}
      {message && (
        <div
          className="admin-error-box"
          style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}
        >
          {message}
        </div>
      )}

      <div className="admin-form-group">
        <label>ایمیل مدیر جدید:</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="email"
            className="admin-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="newadmin@example.com"
            style={{ direction: 'ltr', textAlign: 'left' }}
            required
          />
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleAdd}
            disabled={saving}
            style={{ width: 'auto', whiteSpace: 'nowrap' }}
          >
            {saving ? 'در حال افزودن...' : '➕ افزودن مدیر'}
          </button>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          ابتدا حساب ورود او را در Supabase → Authentication → Users بسازید، سپس ایمیل را اینجا اضافه کنید.
        </span>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>در حال بارگذاری...</p>
      ) : admins.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>هنوز مدیری در فهرست نیست.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ایمیل</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((email) => {
              const isSelf = email === currentEmail
              return (
                <tr key={email}>
                  <td style={{ direction: 'ltr', textAlign: 'left' }}>{email}</td>
                  <td>
                    {isSelf ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '0.3rem',
                          fontWeight: 700,
                        }}
                      >
                        شما
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '0.3rem',
                          fontWeight: 700,
                        }}
                      >
                        فعال
                      </span>
                    )}
                  </td>
                  <td className="admin-table-actions">
                    {!isSelf && (
                      <button
                        className="admin-btn-icon delete"
                        onClick={() => handleRemove(email)}
                        title="حذف این مدیر"
                      >
                        🗑
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}