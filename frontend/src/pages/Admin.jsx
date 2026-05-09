import { useState, useEffect } from 'react'
import { api } from '../api'
import { useLanguage } from '../LanguageContext'
import { useAuth } from '../AuthContext'

function ViewReceiptButton({ reservationId, t }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const openReceipt = () => {
    setLoading(true)
    setError('')
    api.admin.receiptBlob(reservationId)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      })
      .catch(() => setError(t('admin.viewReceipt.error')))
      .finally(() => setLoading(false))
  }
  return (
    <>
      <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9rem' }} onClick={openReceipt} disabled={loading}>
        {loading ? t('admin.viewReceipt.loading') : t('admin.viewReceipt')}
      </button>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 4 }}>{error}</p>}
    </>
  )
}

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

function FeedManagement({ t }) {
  const [feedTypes, setFeedTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', quantity: 0, unit: 'kg', price: 0 })

  const load = () => {
    api.admin.feedTypes()
      .then(setFeedTypes)
      .catch((e) => setError(e.detail || t('admin.feed.error.load')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [t])

  const startAdd = () => {
    setEditing('new')
    setFormData({ name: '', description: '', quantity: 0, unit: 'kg', price: 0 })
  }

  const startEdit = (feed) => {
    setEditing(feed.id)
    setFormData({
      name: feed.name,
      description: feed.description || '',
      quantity: feed.quantity,
      unit: feed.unit,
      price: feed.price ?? 0,
    })
  }

  const cancel = () => {
    setEditing(null)
    setFormData({ name: '', description: '', quantity: 0, unit: 'kg', price: 0 })
  }

  const save = async () => {
    setError('')
    try {
      if (editing === 'new') {
        await api.admin.createFeedType(formData)
      } else {
        await api.admin.updateFeedType(editing, formData)
      }
      cancel()
      load()
    } catch (e) {
      setError(e.detail || (editing === 'new' ? t('admin.feed.error.create') : t('admin.feed.error.update')))
    }
  }

  const deleteFeed = async (id) => {
    if (!confirm(t('admin.feed.deleteConfirm'))) return
    setError('')
    try {
      await api.admin.deleteFeedType(id)
      load()
    } catch (e) {
      setError(e.detail || t('admin.feed.error.delete'))
      if (e.detail && e.detail.includes('reservations')) {
        alert(t('admin.feed.deleteError'))
      }
    }
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('admin.feed.title')}</h2>
        {!editing && (
          <button className="btn btn-primary" onClick={startAdd} style={{ padding: '8px 16px' }}>
            {t('admin.feed.add')}
          </button>
        )}
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
      {editing === 'new' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{t('admin.feed.add')}</h3>
          <div className="input-group">
            <label>{t('admin.feed.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.feed.name')}
              required
            />
          </div>
          <div className="input-group">
            <label>{t('admin.feed.description')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.feed.description')}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>{t('admin.feed.quantity')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>{t('admin.feed.unit')}</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg"
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>{t('admin.feed.price')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={save}>{t('admin.feed.save')}</button>
            <button className="btn btn-secondary" onClick={cancel}>{t('admin.feed.cancel')}</button>
          </div>
        </div>
      )}
      {feedTypes.length === 0 ? (
        <div className="empty-state">{t('admin.feed.empty')}</div>
      ) : (
        feedTypes.map((feed) => (
          <div key={feed.id} className="card">
            {editing === feed.id ? (
              <>
                <div className="input-group">
                  <label>{t('admin.feed.name')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>{t('admin.feed.description')}</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>{t('admin.feed.quantity')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>{t('admin.feed.unit')}</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>{t('admin.feed.price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={save}>{t('admin.feed.save')}</button>
                  <button className="btn btn-secondary" onClick={cancel}>{t('admin.feed.cancel')}</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{feed.name}</h3>
                    {feed.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{feed.description}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {feed.quantity} {feed.unit}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                      {t('admin.feed.priceLabel', { defaultValue: '' }) || ''}{feed.price != null ? `${feed.price} / ${feed.unit}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => startEdit(feed)} style={{ fontSize: '0.9rem' }}>
                      {t('admin.feed.edit')}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteFeed(feed.id)}
                      style={{ fontSize: '0.9rem' }}
                      disabled={feed.has_reservations}
                      title={feed.has_reservations ? t('admin.feed.hasReservations') : undefined}
                    >
                      {t('admin.feed.delete')}
                    </button>
                    {feed.has_reservations && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('admin.feed.hasReservations')}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </>
  )
}

function ReservationsTab({ t }) {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acting, setActing] = useState(null)

  const load = () => {
    api.admin.reservations()
      .then(setReservations)
      .catch((e) => setError(e.detail || t('admin.error.load')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [t])

  const approve = async (id) => {
    setActing(id)
    try {
      await api.admin.approve(id)
      load()
    } catch (e) {
      setError(e.detail || t('admin.error.approve'))
    } finally {
      setActing(null)
    }
  }

  const reject = async (id) => {
    setActing(id)
    try {
      await api.admin.reject(id)
      load()
    } catch (e) {
      setError(e.detail || t('admin.error.reject'))
    } finally {
      setActing(null)
    }
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>

  const pending = reservations.filter((r) => r.status === 'pending_payment' || r.status === 'waiting_approval')
  // Separate reservations with receipts (waiting_approval) from those without (pending_payment)
  const withReceipts = pending.filter((r) => r.status === 'waiting_approval')
  const withoutReceipts = pending.filter((r) => r.status === 'pending_payment')

  return (
    <>
      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
      {pending.length === 0 ? (
        <div className="empty-state">{t('admin.empty')}</div>
      ) : (
        <>
          {withReceipts.length > 0 && (
            <>
              <h3 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--text-muted)' }}>
                Reservations with receipts ({withReceipts.length})
              </h3>
              {withReceipts.map((r) => (
                <div key={r.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>#{r.id} · {r.feed_type_name}</strong>
                    {statusBadge(r.status, t)}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {t('admin.user')}: {r.user_national_id} · {t('admin.qty')}: {r.quantity}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</p>
                  {r.receipt_path && (
                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                      <ViewReceiptButton reservationId={r.id} t={t} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      disabled={acting === r.id}
                      onClick={() => approve(r.id)}
                    >
                      {acting === r.id ? '...' : t('admin.approve')}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={acting === r.id}
                      onClick={() => reject(r.id)}
                    >
                      {t('admin.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          {withoutReceipts.length > 0 && (
            <>
              <h3 style={{ fontSize: '1rem', marginTop: withReceipts.length > 0 ? 24 : 0, marginBottom: 12, color: 'var(--text-muted)' }}>
                Reservations waiting for receipt ({withoutReceipts.length})
              </h3>
              {withoutReceipts.map((r) => (
                <div key={r.id} className="card" style={{ marginBottom: 12, opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>#{r.id} · {r.feed_type_name}</strong>
                    {statusBadge(r.status, t)}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {t('admin.user')}: {r.user_national_id} · {t('admin.qty')}: {r.quantity}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</p>
                  <p style={{ color: 'var(--warning)', fontSize: '0.9rem', marginTop: 8 }}>
                    Waiting for user to upload receipt...
                  </p>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  )
}

function UsersManagement({ t }) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [formData, setFormData] = useState({ national_id: '', password: '', role: 'user' })

  const load = () => {
    api.admin.users()
      .then(setUsers)
      .catch((e) => setError(e.detail || t('admin.users.error.load')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [t])

  const startAdd = () => {
    setShowAdd(true)
    setFormData({ national_id: '', password: '', role: 'user' })
  }

  const cancelAdd = () => {
    setShowAdd(false)
    setFormData({ national_id: '', password: '', role: 'user' })
  }

  const createUser = async () => {
    if (!formData.national_id.trim() || !formData.password) {
      setError(t('admin.users.error.required'))
      return
    }
    if (formData.password.length < 6) {
      setError(t('admin.users.error.passwordLength'))
      return
    }
    setError('')
    try {
      await api.admin.createUser({
        national_id: formData.national_id.trim(),
        password: formData.password,
        role: formData.role,
      })
      cancelAdd()
      load()
    } catch (e) {
      setError(e.detail || t('admin.users.error.create'))
    }
  }

  const deleteUser = async (id) => {
    if (!confirm(t('admin.users.deleteConfirm'))) return
    setError('')
    try {
      await api.admin.deleteUser(id)
      load()
    } catch (e) {
      setError(e.detail || t('admin.users.error.delete'))
    }
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>

  const adminCount = users.filter((u) => u.role === 'admin').length

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('admin.users.title')}</h2>
        {!showAdd && (
          <button className="btn btn-primary" onClick={startAdd} style={{ padding: '8px 16px' }}>
            {t('admin.users.add')}
          </button>
        )}
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{t('admin.users.add')}</h3>
          <div className="input-group">
            <label>{t('admin.users.nationalId')}</label>
            <input
              type="text"
              value={formData.national_id}
              onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
              placeholder={t('admin.users.nationalId')}
              required
            />
          </div>
          <div className="input-group">
            <label>{t('admin.users.password')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('admin.users.password')}
              required
              minLength={6}
            />
          </div>
          <div className="input-group">
            <label>{t('admin.users.role')}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface)', color: 'inherit' }}
            >
              <option value="user">{t('admin.users.roleUser')}</option>
              <option value="admin">{t('admin.users.roleAdmin')}</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={createUser}>{t('admin.users.save')}</button>
            <button className="btn btn-secondary" onClick={cancelAdd}>{t('admin.users.cancel')}</button>
          </div>
        </div>
      )}
      {users.length === 0 ? (
        <div className="empty-state">{t('admin.users.empty')}</div>
      ) : (
        users.map((u) => (
          <div key={u.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '1rem' }}>{u.national_id}</strong>
                  <span className={`badge ${u.role === 'admin' ? 'badge-approved' : ''}`} style={{ fontSize: '0.75rem' }}>
                    {u.role === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleUser')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('admin.users.createdAt')}: {new Date(u.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteUser(u.id)}
                  style={{ fontSize: '0.9rem' }}
                  disabled={
                    u.id === currentUser?.id ||
                    u.has_reservations ||
                    (u.role === 'admin' && adminCount <= 1)
                  }
                  title={
                    u.id === currentUser?.id
                      ? t('admin.users.cannotDeleteSelf')
                      : u.has_reservations
                        ? t('admin.users.hasReservations')
                        : u.role === 'admin' && adminCount <= 1
                          ? t('admin.users.cannotDeleteLastAdmin')
                          : undefined
                  }
                >
                  {t('admin.users.delete')}
                </button>
                {(u.id === currentUser?.id || u.has_reservations || (u.role === 'admin' && adminCount <= 1)) && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {u.id === currentUser?.id
                      ? t('admin.users.cannotDeleteSelf')
                      : u.has_reservations
                        ? t('admin.users.hasReservations')
                        : t('admin.users.cannotDeleteLastAdmin')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}

function BankInfoTab({ t }) {
  const [bankInfo, setBankInfo] = useState({ account_name: '', bank_name: '', account_number: '', iban: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.admin.getBankInfo()
      .then(setBankInfo)
      .catch((e) => setError(e.detail || t('admin.bank.error.load')))
      .finally(() => setLoading(false))
  }, [t])

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await api.admin.updateBankInfo(bankInfo)
      setSuccess(t('admin.bank.saved'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.detail || t('admin.bank.error.save'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>

  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>{t('admin.bank.title')}</h2>
      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: 'var(--accent)', marginBottom: 12 }}>{success}</p>}
      <div className="card">
        <div className="input-group">
          <label>{t('admin.bank.accountName')}</label>
          <input
            type="text"
            value={bankInfo.account_name}
            onChange={(e) => setBankInfo({ ...bankInfo, account_name: e.target.value })}
            placeholder={t('admin.bank.accountName')}
            required
          />
        </div>
        <div className="input-group">
          <label>{t('admin.bank.bankName')}</label>
          <input
            type="text"
            value={bankInfo.bank_name}
            onChange={(e) => setBankInfo({ ...bankInfo, bank_name: e.target.value })}
            placeholder={t('admin.bank.bankName')}
            required
          />
        </div>
        <div className="input-group">
          <label>{t('admin.bank.accountNumber')}</label>
          <input
            type="text"
            value={bankInfo.account_number}
            onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
            placeholder={t('admin.bank.accountNumber')}
            required
          />
        </div>
        <div className="input-group">
          <label>{t('admin.bank.iban')}</label>
          <input
            type="text"
            value={bankInfo.iban}
            onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
            placeholder={t('admin.bank.iban')}
            required
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>
          {saving ? t('app.loading') : t('admin.bank.save')}
        </button>
      </div>
    </>
  )
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('reservations')
  const { t } = useLanguage()

  return (
    <>
      <h1 className="page-title">{t('admin.title')}</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'reservations' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'reservations' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'reservations' ? 600 : 400,
          }}
        >
          {t('admin.tab.reservations')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'feed' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'feed' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'feed' ? 600 : 400,
          }}
        >
          {t('admin.tab.feed')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'bank' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'bank' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'bank' ? 600 : 400,
          }}
        >
          {t('admin.tab.bank')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'users' ? 600 : 400,
          }}
        >
          {t('admin.tab.users')}
        </button>
      </div>
      {activeTab === 'reservations' && <ReservationsTab t={t} />}
      {activeTab === 'feed' && <FeedManagement t={t} />}
      {activeTab === 'bank' && <BankInfoTab t={t} />}
      {activeTab === 'users' && <UsersManagement t={t} />}
    </>
  )
}
