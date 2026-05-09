import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

export default function Feed() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    api.feed.list()
      .then(setList)
      .catch((e) => setError(e.detail || t('feed.error.generic')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>
  if (error) return <div className="page"><p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>{error}</p></div>

  return (
    <>
      <h1 className="page-title">{t('feed.title')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
        {t('feed.subtitle')}
      </p>
      {list.length === 0 ? (
        <div className="empty-state">{t('feed.empty')}</div>
      ) : (
        list.map((feed) => (
          <div key={feed.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h3 style={{ fontSize: '1.1rem' }}>{feed.name}</h3>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {feed.quantity} {feed.unit}
                </div>
                {feed.price != null && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    {feed.price} / {feed.unit}
                  </div>
                )}
              </div>
            </div>
            {feed.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>{feed.description}</p>}
            <Link to={`/reserve?feed_id=${feed.id}`} className="btn btn-primary" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
              {t('feed.reserve')}
            </Link>
          </div>
        ))
      )}
    </>
  )
}
