import { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import './Admin.css'

export default function AdminLayout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true

    const checkAdmin = async (user) => {
      if (!user) return
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()
      if (!alive) return
      if (!error && !data) {
        setForbidden(true)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return
      if (!session) {
        navigate('/admin/login')
      } else {
        setSession(session)
        checkAdmin(session.user)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/admin/login')
      } else {
        setForbidden(false)
        checkAdmin(session.user)
      }
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
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

  if (forbidden) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-title">دسترسی غیرمجاز</h1>
            <p className="admin-login-subtitle">
              حساب شما در فهرست مدیران نیست. با ایمیل ثبت‌شده در فهرست مدیران وارد شوید یا با مدیر سایت تماس بگیرید.
            </p>
          </div>
          <button className="admin-btn-primary" onClick={handleLogout}>
            خروج از حساب
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <span>⚙️ پنل مدیریت محصولات</span>
          <span className="admin-brand-tag">Back-Office</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-nav-link">
            📦 محصولات
          </NavLink>
          <NavLink to="/admin/team" className="admin-nav-link">
            👥 تیم مدیران
          </NavLink>
        </nav>
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