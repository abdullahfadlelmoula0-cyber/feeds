import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { LanguageProvider, useLanguage } from './LanguageContext'
import Layout from './Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Reserve from './pages/Reserve'
import MyReservations from './pages/MyReservations'
import ReservationDetail from './pages/ReservationDetail'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'
import { api } from './api'
import { useState, useEffect } from 'react'

function BackendStatusBanner() {
  const [down, setDown] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    api.health()
      .then(() => setDown(false))
      .catch(() => setDown(true))
  }, [])
  if (!down || dismissed) return null
  return (
    <div style={{
      background: '#c0392b',
      color: '#fff',
      padding: '8px 12px',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <span>
        Cannot reach the backend. Start it with: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>cd backend && .\venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8080</code>
      </span>
      <button type="button" onClick={() => setDismissed(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Dismiss</button>
    </div>
  )
}

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  if (loading) return <div className="page"><p style={{ textAlign: 'center', padding: 40 }}>{t('app.loading')}</p></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="reserve" element={<PrivateRoute><Reserve /></PrivateRoute>} />
        <Route path="reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
        <Route path="reservations/:id" element={<PrivateRoute><ReservationDetail /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app-shell">
          <BackendStatusBanner />
          <AppRoutes />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
