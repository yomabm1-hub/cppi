import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Phone, Lock, User, Gift } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [referralValid, setReferralValid] = useState(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [activeTab, setActiveTab] = useState('phone')
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const referral = searchParams.get('ref')
    if (referral) {
      const code = referral.toUpperCase().slice(0, 6)
      setFormData((prev) => ({ ...prev, referralCode: code }))
      if (code.length === 6) {
        setReferralValid(true)
      }
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    
    // Validate referral code if provided
    if (e.target.name === 'referralCode' && e.target.value.length === 6) {
      // Optional: Add referral code validation API call here
      setReferralValid(true)
    } else if (e.target.name === 'referralCode' && e.target.value.length === 0) {
      setReferralValid(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (activeTab === 'email' && !formData.email) {
      toast.error('Please enter your email address')
      return
    }

    if (activeTab === 'phone' && !formData.phone) {
      toast.error('Please enter your phone number')
      return
    }

    if (!acceptedTerms) {
      toast.error('You must accept the Terms of Use and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      if (activeTab === 'email') {
        delete registerData.phone
      } else {
        delete registerData.email
      }
      if (!registerData.referralCode) {
        delete registerData.referralCode
      }
      if (!registerData.email) {
        delete registerData.email
      }
      if (!registerData.phone) {
        delete registerData.phone
      }
      await register(registerData)
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/95 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-400">
            CP-Investment
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Join the platform to manage deposits, VIP levels, and rewards in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
          <form
            className="space-y-4 rounded-2xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6"
            onSubmit={handleSubmit}
          >
            <div>
              <div className="bg-slate-900/80 rounded-2xl p-1 grid grid-cols-2 gap-1 border border-slate-800">
                {[
                  { id: 'phone', label: 'Phone Number', icon: Phone },
                  { id: 'email', label: 'Email Address', icon: Mail },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                      activeTab === id
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                    aria-pressed={activeTab === id}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-2">
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter your full name (optional)"
                />
              </div>
            </div>

            {activeTab === 'phone' ? (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-200 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  We will use your phone for account verification.
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    placeholder="Enter your email"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  We will use your email for account verification.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="referralCode"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  maxLength={6}
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="input-field pl-10 uppercase bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter referral code"
                />
              </div>
              {referralValid && (
                <p className="mt-1 text-xs text-emerald-400">✓ Valid referral code</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I have read and accept the{' '}
                  <Link
                    to="/terms-of-use"
                    className="font-semibold text-emerald-300 hover:text-emerald-200 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy-policy"
                    className="font-semibold text-emerald-300 hover:text-emerald-200 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  . Read our{' '}
                  <Link
                    to="/faq"
                    className="font-semibold text-emerald-300 hover:text-emerald-200 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FAQ
                  </Link>{' '}
                  to learn how this platform works.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></div>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

