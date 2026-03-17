import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock, Shield, TrendingUp, Users, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(identifier, password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/35 blur-[120px]" />
        <div className="animate-blob animation-delay-2000 absolute bottom-10 right-[-50px] h-80 w-80 rounded-full bg-sky-500/25 blur-[140px]" />
        <div className="animate-blob animation-delay-4000 absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="animate-float-slow absolute -right-10 top-10 hidden h-48 w-48 rounded-full border border-emerald-500/20 lg:block" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-slate-900/70 p-2 shadow-2xl ring-1 ring-emerald-500/20 backdrop-blur-xl lg:grid-cols-2 lg:p-6">
            <div className="hidden lg:order-1 lg:flex lg:flex-col lg:space-y-8 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-sky-500 p-8 text-white shadow-lg">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
                  <img
                    src="/CP-Investment.png"
                    alt="CP-Investment Logo"
                    className="h-8 w-8 rounded-full border border-white/30 bg-white/80 object-contain p-1"
                  />
                  <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                    CP-Investment Platform
                  </p>
                </div>
                <h1 className="text-4xl font-bold leading-tight">
                  Welcome to CP‑Investment.
                </h1>
                <p className="mt-4 text-base text-white/80">
                  Track balances, manage VIP levels, and handle deposits and withdrawals from a
                  single, secure dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/30 bg-white/10 p-4">
                  <p className="text-sm text-white/70">Daily payouts</p>
                  <p className="mt-2 text-3xl font-semibold">+$2.4k</p>
                  <p className="text-xs text-white/60">Average across VIP tiers</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/10 p-4">
                  <p className="text-sm text-white/70">Active investors</p>
                  <p className="mt-2 text-3xl font-semibold">18.7k</p>
                  <p className="text-xs text-white/60">Verified community members</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Shield, label: 'Multi-layer security & KYC protection' },
                  { icon: TrendingUp, label: 'Automated VIP earning cycles' },
                  { icon: Users, label: 'Multi-level referral bonuses' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-3 py-2"
                  >
                    <div className="rounded-full bg-white/10 p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-white/80">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 rounded-2xl bg-slate-950/90 border border-slate-800 px-6 py-8 shadow-xl sm:px-10 lg:order-2">
              <div className="mb-8 space-y-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700">
                  <img
                    src="/CP-Investment.png"
                    alt="CP-Investment Logo"
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                  Welcome back
                </p>
                <h2 className="text-3xl font-bold text-slate-50">Sign in to CP-Investment</h2>
                <p className="text-sm text-slate-400">
                  Access your dashboard, VIP earnings, and wallet in seconds.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 py-3 pl-12 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Create one now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

