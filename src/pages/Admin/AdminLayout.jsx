import { useEffect, useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import './Admin.css'

export default function AdminLayout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        navigate('/admin/login')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="admin-login-wrapper">
        <div style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 600 }}>
          در حال بارگذاری پنل مدیریت...
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <span>⚙️ پنل مدیریت محصولات</span>
          <span className="admin-brand-tag">Back-Office</span>
        </div>
        <div className="admin-user-info">
          <span className="admin-email">{session.user.email}</span>
          <button className="admin-btn-logout" onClick={handleLogout}>
            خروج
          </button>
        </div>
      </header>
      <main className="admin-container">
        <Outlet />
      </main>
    </div>
  )
}
