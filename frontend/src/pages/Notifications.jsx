import { useState, useEffect } from 'react'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

export default function Notifications() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const load = () => {
    api.notifications.list(false)
      .then(setList)
      .catch((e) => setError(e.detail || t('notifications.error.generic')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [t])

  const markRead = (id) => {
    api.notifications.markRead(id).then(() => load()).catch(() => {})
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>
  if (error) return <div className="page"><p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>{error}</p></div>

  return (
    <>
      <h1 className="page-title">{t('notifications.title')}</h1>
      {list.length === 0 ? (
        <div className="empty-state">{t('notifications.empty')}</div>
      ) : (
        list.map((n) => (
          <div
            key={n.id}
            className={`card notification-item ${n.read ? '' : 'unread'}`}
            style={{ cursor: n.read ? 'default' : 'pointer' }}
            onClick={() => !n.read && markRead(n.id)}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {!n.read && <span className="notification-dot" />}
              <div>
                <strong>{n.title}</strong>
                {n.body && <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.body}</p>}
                <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}
