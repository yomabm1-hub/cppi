import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Deposits from './pages/Deposits'
import Withdrawals from './pages/Withdrawals'
import VIP from './pages/VIP'
import Referrals from './pages/Referrals'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Tasks from './pages/Tasks'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetail from './pages/AdminUserDetail'
import AdminDeposits from './pages/AdminDeposits'
import AdminWithdrawals from './pages/AdminWithdrawals'
import AdminVipManagement from './pages/AdminVipManagement'
import AdminWithdrawalFees from './pages/AdminWithdrawalFees'
import AdminSystemSettings from './pages/AdminSystemSettings'
import AdminAnnouncements from './pages/AdminAnnouncements'
import Chat from './pages/Chat'
import AdminChat from './pages/AdminChat'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import Faq from './pages/Faq'
import useInstallPrompt from './hooks/useInstallPrompt'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (!user.isAdmin) {
    return <Navigate to="/dashboard" />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="deposits" element={<Deposits />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="vip" element={<VIP />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="profile" element={<Profile />} />
        <Route path="chat" element={<Chat />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users/:userId"
          element={
            <AdminRoute>
              <AdminUserDetail />
            </AdminRoute>
          }
        />
        <Route
          path="admin/deposits"
          element={
            <AdminRoute>
              <AdminDeposits />
            </AdminRoute>
          }
        />
        <Route
          path="admin/withdrawals"
          element={
            <AdminRoute>
              <AdminWithdrawals />
            </AdminRoute>
          }
        />
        <Route
          path="admin/vips"
          element={
            <AdminRoute>
              <AdminVipManagement />
            </AdminRoute>
          }
        />
        <Route
          path="admin/withdrawal-fees"
          element={
            <AdminRoute>
              <AdminWithdrawalFees />
            </AdminRoute>
          }
        />
        <Route
          path="admin/system-settings"
          element={
            <AdminRoute>
              <AdminSystemSettings />
            </AdminRoute>
          }
        />
        <Route
          path="admin/announcements"
          element={
            <AdminRoute>
              <AdminAnnouncements />
            </AdminRoute>
          }
        />
        <Route
          path="admin/chat"
          element={
            <AdminRoute>
              <AdminChat />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}

function InstallBanner() {
  const { canPrompt, promptInstall, isIOS, isStandalone } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (isStandalone) {
      setDismissed(true)
    }
  }, [isStandalone])

  if (dismissed || isStandalone) {
    return null
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowGuide(true)
      return
    }

    if (canPrompt) {
      const accepted = await promptInstall()
      if (accepted) {
        setDismissed(true)
      }
    } else {
      setShowGuide(true)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-4 text-slate-50 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
            CP-Investment
          </p>
          <h3 className="mt-1 text-lg font-bold">Install your dashboard app</h3>
          <p className="mt-1 text-xs text-slate-400">
            Add CP‑Investment to your home screen for faster access to balances, VIP levels, and
            withdrawals.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full bg-slate-900/80 p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-50 border border-slate-700"
          aria-label="Dismiss install banner"
        >
          ✕
        </button>
      </div>

      {!showGuide ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleInstallClick}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Install app
          </button>
          <button
            onClick={() => setShowGuide(true)}
            className="w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/80"
          >
            How it works
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-200">
          {isIOS ? (
            <>
              <p className="font-semibold text-slate-50">Install on iPhone & iPad:</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Tap the Share button{' '}
                  <span className="text-slate-400">(square with arrow) in Safari</span>
                </li>
                <li>
                  Select{' '}
                  <span className="font-semibold text-slate-50">&ldquo;Add to Home Screen&rdquo;</span>
                </li>
                <li>
                  Confirm the CP‑Investment name and tap{' '}
                  <span className="font-semibold text-slate-50">&ldquo;Add&rdquo;</span>
                </li>
              </ol>
              <p className="text-slate-400">
                CP‑Investment will appear on your home screen like a native app.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-50">Manual install:</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Open your browser menu (⋮ or ☰)</li>
                <li>
                  Choose{' '}
                  <span className="font-semibold text-slate-50">&ldquo;Install app&rdquo;</span> or{' '}
                  <span className="font-semibold text-slate-50">
                    &ldquo;Add to Home screen&rdquo;
                  </span>
                </li>
                <li>Confirm the CP-Investment prompt</li>
              </ol>
              <p className="text-slate-400">
                After installation, CP‑Investment launches in full-screen mode.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
      <Router>
        <AppRoutes />
        <InstallBanner />
        <Toaster position="top-right" />
      </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App

