import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('حساب مدیر با موفقیت ساخته شد! می‌توانید وارد شوید.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate('/admin')
      }
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
          <h1 className="admin-login-title">
            {isSignUp ? 'ایجاد حساب مدیر جدید' : 'ورود به پنل مدیریت'}
          </h1>
          <p className="admin-login-subtitle">
            برای ورود به مدیریت کاتالوگ، اطلاعات خود را وارد کنید
          </p>
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
            {loading ? 'در حال ارسال...' : isSignUp ? 'ایجاد حساب مدیر' : 'ورود به سیستم'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.875rem' }}
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
            }}
          >
            {isSignUp ? 'حساب کاربری دارید؟ ورود' : 'بار اول است؟ ساخت حساب اولیه مدیر'}
          </button>
        </div>
      </div>
    </div>
  )
}
