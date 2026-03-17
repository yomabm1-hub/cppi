import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock, Shield, TrendingUp, Users } from 'lucide-react'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-500/40 blur-[120px]" />
        <div className="animate-blob animation-delay-2000 absolute bottom-10 right-[-50px] h-80 w-80 rounded-full bg-emerald-500/30 blur-[140px]" />
        <div className="animate-blob animation-delay-4000 absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="animate-float-slow absolute -right-10 top-10 hidden h-48 w-48 rounded-full border border-white/10 lg:block" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white/5 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl lg:grid-cols-2 lg:p-6">
            <div className="order-2 space-y-8 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-500 p-8 text-white shadow-lg lg:order-1">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
                  <img src="/CP-Investment.png" alt="CP-Investment Logo" className="h-8 w-8 rounded-full border border-white/30 bg-white/80 object-contain p-1" />
                  <p className="text-sm uppercase tracking-[0.3em] text-white/80">CP-Investment Platform</p>
                </div>
                <h1 className="text-4xl font-bold leading-tight">
                  Secure investments, smarter returns.
                </h1>
                <p className="mt-4 text-base text-white/80">
                  Log in to manage your portfolio, monitor referrals, and withdraw earnings in real time.
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
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-3 py-2">
                    <div className="rounded-full bg-white/10 p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-white/80">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 rounded-2xl bg-white px-6 py-8 shadow-xl sm:px-10 lg:order-2">
              <div className="mb-8 space-y-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                  <img src="/CP-Investment.png" alt="CP-Investment Logo" className="h-12 w-12 object-contain" />
                </div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary-600">Welcome back</p>
                <h2 className="text-3xl font-bold text-gray-900">Sign in to CP-Investment</h2>
                <p className="text-sm text-gray-500">Access your dashboard and earnings instantly.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-gray-700">
                    Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500" />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-primary-600 py-3 font-semibold text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-500 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
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

