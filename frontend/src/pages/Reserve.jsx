import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'

export default function Reserve() {
  const [searchParams] = useSearchParams()
  const feedIdParam = searchParams.get('feed_id')
  const navigate = useNavigate()
  const [feedTypes, setFeedTypes] = useState([])
  const [feedTypeId, setFeedTypeId] = useState(feedIdParam ? parseInt(feedIdParam, 10) : '')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t, lang } = useLanguage()

  useEffect(() => {
    api.feed.list().then(setFeedTypes).catch(() => setError(t('reserve.error.loadFeed')))
  }, [t])

  useEffect(() => {
    if (feedIdParam && feedTypes.length) {
      const id = parseInt(feedIdParam, 10)
      if (feedTypes.some((f) => f.id === id)) setFeedTypeId(id)
    }
  }, [feedIdParam, feedTypes])

  const selectedFeed = feedTypes.find((f) => f.id === Number(feedTypeId))
  const maxQty = selectedFeed ? selectedFeed.quantity : 0
  const unitPrice = selectedFeed?.price ?? 0
  const quantityNumber = parseFloat(quantity) || 0
  const total = unitPrice * quantityNumber

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const q = parseFloat(quantity)
    if (!q || q <= 0) {
      setError(t('reserve.error.invalidQty'))
      return
    }
    if (selectedFeed && q > maxQty) {
      setError(`${t('reserve.error.maxQty')}: ${maxQty} ${selectedFeed.unit}`)
      return
    }
    if (!feedTypeId) {
      setError(t('reserve.error.selectFeed'))
      return
    }
    setLoading(true)
    try {
      const res = await api.reservations.create(Number(feedTypeId), q)
      navigate(`/reservations/${res.id}`)
    } catch (err) {
      setError(err.detail || t('reserve.error.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="page-title">{t('reserve.title')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
        {t('reserve.subtitle')}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t('reserve.feedType')}</label>
          <select
            value={feedTypeId}
            onChange={(e) => setFeedTypeId(e.target.value ? parseInt(e.target.value, 10) : '')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: '1rem',
            }}
          >
            <option value="">{t('reserve.feedType.placeholder')}</option>
            {feedTypes.map((f) => (
              <option key={f.id} value={f.id}>
                {lang === 'ar'
                  ? `${f.name} — متاح ${f.quantity} ${f.unit}`
                  : `${f.name} — ${f.quantity} ${f.unit} available`}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>
            {t('reserve.quantity')}{' '}
            {selectedFeed &&
              (lang === 'ar'
                ? `(الحد الأقصى ${maxQty} ${selectedFeed.unit})`
                : `(max ${maxQty} ${selectedFeed.unit})`)}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={maxQty || undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('reserve.quantity.placeholder')}
            required
          />
        </div>
        {selectedFeed && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>
              {t('reserve.unitPrice')}: {unitPrice} / {selectedFeed.unit}
            </p>
            <p style={{ fontWeight: 600 }}>
              {t('reserve.total')}: {isNaN(total) ? 0 : total.toFixed(2)}
            </p>
          </div>
        )}
        {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.9rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('reserve.submitting') : t('reserve.submit')}
        </button>
      </form>
    </>
  )
}
