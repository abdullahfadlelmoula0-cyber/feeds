import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

function statusBadge(s, t) {
  const map = {
    pending_payment: 'badge-pending',
    waiting_approval: 'badge-waiting',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    auto_rejected: 'badge-auto_rejected',
  }
  const key = `status.${s}`
  const label = t(key)
  return <span className={`badge ${map[s] || ''}`}>{label}</span>
}

export default function MyReservations() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const load = () => {
    api.reservations.list()
      .then(setList)
      .catch((e) => setError(e.detail || t('myReservations.error.generic')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [t])

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>
  if (error) return <div className="page"><p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>{error}</p></div>

  return (
    <>
      <h1 className="page-title">{t('myReservations.title')}</h1>
      {list.length === 0 ? (
        <div className="empty-state">
          {t('myReservations.empty')}{' '}
          <Link to="/reserve">{t('myReservations.empty.action')}</Link>{' '}
          {t('myReservations.empty.fromFeed')}
        </div>
      ) : (
        list.map((r) => (
          <Link key={r.id} to={`/reservations/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong>{r.feed_type_name} — {r.quantity} {r.feed_type_unit || 'unit'}</strong>
                {statusBadge(r.status, t)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                #{r.id} · {new Date(r.created_at).toLocaleString()}
              </div>
              {r.total_price != null && (
                <div style={{ marginTop: 4, fontSize: '0.9rem' }}>
                  {t('myReservations.total')}: {r.total_price.toFixed(2)}
                </div>
              )}
            </div>
          </Link>
        ))
      )}
    </>
  )
}
