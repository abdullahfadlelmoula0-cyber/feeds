import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const label = t(`status.${s}`)
  return <span className={`badge ${map[s] || ''}`}>{label}</span>
}

export default function ReservationDetail() {
  const { id } = useParams()
  const [reservation, setReservation] = useState(null)
  const [bank, setBank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { t, lang } = useLanguage()

  const load = () => {
    api.reservations.get(Number(id))
      .then(setReservation)
      .catch((e) => setError(e.detail || t('reservationDetail.error.notFound')))
      .finally(() => setLoading(false))
    api.reservations.bankDetails().then(setBank).catch(() => {})
  }

  useEffect(() => { load() }, [id])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setError(t('reservationDetail.error.invalidImage'))
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('reservationDetail.error.invalidImage'))
      return
    }
    
    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    
    setError('')
    setSuccess('')
    setUploading(true)
    try {
      const result = await api.reservations.uploadReceipt(Number(id), file)
      // Reload to get updated status
      await load()
      // Clear file input
      const fileInput = document.getElementById('receipt-upload')
      if (fileInput) fileInput.value = ''
      setSuccess('Receipt uploaded successfully! Waiting for admin approval.')
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      const errorMsg = err.detail || err.message || t('reservationDetail.error.uploadFailed')
      setError(errorMsg)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>
  if (error && !reservation) return <div className="page"><p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>{error}</p></div>
  if (!reservation) return null

  const canUpload = reservation.status === 'pending_payment'

  return (
    <>
      <h1 className="page-title">
        {t('reservationDetail.title')} #{reservation.id}
      </h1>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <strong>{reservation.feed_type_name}</strong>
          {statusBadge(reservation.status, t)}
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          {t('reservationDetail.quantity')}: {reservation.quantity} {reservation.feed_type_unit || 'unit'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t('reservationDetail.createdAt')}: {new Date(reservation.created_at).toLocaleString()}
        </p>
        {reservation.unit_price != null && (
          <p style={{ fontSize: '0.9rem', marginTop: 4 }}>
            {t('reservationDetail.unitPrice')}: {reservation.unit_price} {reservation.feed_type_unit || 'unit'}
          </p>
        )}
        {reservation.total_price != null && (
          <p style={{ fontSize: '0.9rem', marginTop: 2, fontWeight: 600 }}>
            {t('reservationDetail.total')}: {reservation.total_price.toFixed(2)}
          </p>
        )}
      </div>

      {reservation.status === 'pending_payment' && (
        <>
          {bank && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>{t('reservationDetail.bank.title')}</h3>
              <p><strong>{t('reservationDetail.bank.accountName')}:</strong> {bank.account_name}</p>
              <p><strong>{t('reservationDetail.bank.bank')}:</strong> {bank.bank_name}</p>
              <p><strong>{t('reservationDetail.bank.accountNumber')}:</strong> {bank.account_number}</p>
              <p><strong>{t('reservationDetail.bank.iban')}:</strong> {bank.iban}</p>
            </div>
          )}
          {canUpload && (
            <div className="card">
              <label style={{ display: 'block', marginBottom: 8 }}>{t('reservationDetail.upload.label')}</label>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                disabled={uploading}
                style={{ marginBottom: 8, display: 'none' }}
              />
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 8 }}>{error}</p>}
              {success && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: 8 }}>{success}</p>}
              <label
                htmlFor="receipt-upload"
                className="btn btn-primary"
                style={{ marginTop: 8, display: 'block', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? t('reservationDetail.upload.uploading') : t('reservationDetail.upload.choose')}
              </label>
            </div>
          )}
        </>
      )}
    </>
  )
}
