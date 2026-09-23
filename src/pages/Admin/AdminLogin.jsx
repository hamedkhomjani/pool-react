import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'خطا در ورود به حساب کاربری')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1 className="admin-login-title">ورود به پنل مدیریت</h1>
          <p className="admin-login-subtitle">
            برای ورود به مدیریت کاتالوگ، اطلاعات خود را وارد کنید
          </p>
        </div>

        {error && <div className="admin-error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>ایمیل مدیر:</label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>رمز عبور:</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود به سیستم'}
          </button>
        </form>
      </div>
    </div>
  )
}