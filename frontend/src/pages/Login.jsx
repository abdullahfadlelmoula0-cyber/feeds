import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

export default function Login() {
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.message
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token, role } = await api.auth.login(nationalId, password)
      localStorage.setItem('token', access_token)
      const user = await api.auth.me()
      login(access_token, user)
      navigate(role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.detail || t('login.error.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 360, margin: '0 auto', paddingTop: 48 }}>
      <h1 className="page-title">{t('login.title')}</h1>
      {message && <p style={{ color: 'var(--accent)', marginBottom: 16 }}>{message}</p>}
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('login.subtitle')}</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t('login.nationalId')}</label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder={t('login.nationalId.placeholder')}
            required
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <label>{t('login.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.password.placeholder')}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.9rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('login.noAccount')}{' '}
        <Link to="/register">{t('login.registerLink')}</Link>
      </p>
    </div>
  )
}
