import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

export default function Register() {
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError(t('register.error.mismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('register.error.tooShort'))
      return
    }
    setLoading(true)
    try {
      await api.auth.register(nationalId, password)
      navigate('/login', { state: { message: t('register.success') } })
    } catch (err) {
      setError(err.detail || t('register.error.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 360, margin: '0 auto', paddingTop: 48 }}>
      <h1 className="page-title">{t('register.title')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('register.subtitle')}</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t('register.nationalId')}</label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder={t('register.nationalId.placeholder')}
            required
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <label>{t('register.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('register.password.placeholder')}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="input-group">
          <label>{t('register.confirmPassword')}</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('register.confirmPassword.placeholder')}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.9rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('register.haveAccount')}{' '}
        <Link to="/login">{t('register.signInLink')}</Link>
      </p>
    </div>
  )
}
