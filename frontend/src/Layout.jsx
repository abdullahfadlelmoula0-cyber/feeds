import { Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { api } from './api'
import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    api.notifications.list(true).then((list) => setUnreadCount(list.length)).catch(() => {})
  }, [user, location.pathname])

  const nav = [
    { path: '/', labelKey: 'layout.nav.feed' },
    { path: '/reserve', labelKey: 'layout.nav.reserve' },
    { path: '/reservations', labelKey: 'layout.nav.myReservations' },
    { path: '/notifications', labelKey: 'layout.nav.notifications', badge: unreadCount },
  ]
  if (user?.role === 'admin') nav.push({ path: '/admin', labelKey: 'layout.nav.admin' })

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en')
  }

  return (
    <>
      <header style={{
        background: 'var(--surface)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('layout.appTitle')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={toggleLang}
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {lang === 'en' ? t('layout.lang.ar') : t('layout.lang.en')}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.national_id}</span>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={logout}>
            {t('layout.logout')}
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        background: 'var(--surface)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {nav.map(({ path, labelKey, badge }) => (
          <Link
            key={path}
            to={path}
            style={{
              color: location.pathname === path ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: location.pathname === path ? 600 : 400,
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {t(labelKey)}
            {badge > 0 && <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>{badge}</span>}
          </Link>
        ))}
      </nav>
    </>
  )
}
