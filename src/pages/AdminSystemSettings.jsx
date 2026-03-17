import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Settings, RefreshCw } from 'lucide-react'
import { adminAPI } from '../services/api'

const fields = [
  {
    key: 'minDepositAmount',
    label: 'Minimum Deposit Amount',
    helper: 'Smallest deposit amount users can submit.',
  },
  {
    key: 'minWithdrawalAmount',
    label: 'Minimum Withdrawal Amount',
    helper: 'Smallest withdrawal amount users can request.',
  },
]

const referralFields = [
  { key: 'referralBonusLevel1Rate', label: 'Referral Level 1 Bonus (%)' },
  { key: 'referralBonusLevel2Rate', label: 'Referral Level 2 Bonus (%)' },
  { key: 'referralBonusLevel3Rate', label: 'Referral Level 3 Bonus (%)' },
]

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({
    minDepositAmount: '',
    minWithdrawalAmount: '',
    referralBonusLevel1Rate: '',
    referralBonusLevel2Rate: '',
    referralBonusLevel3Rate: '',
    isDepositEnabled: true,
    isWithdrawalEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getSystemSettings()
      const data = response.data.data || {}
      setSettings(data)
      setForm({
        minDepositAmount: data.minDepositAmount ?? '',
        minWithdrawalAmount: data.minWithdrawalAmount ?? '',
        referralBonusLevel1Rate: data.referralBonusLevel1Rate != null ? (Number(data.referralBonusLevel1Rate) * 100).toFixed(2) : '',
        referralBonusLevel2Rate: data.referralBonusLevel2Rate != null ? (Number(data.referralBonusLevel2Rate) * 100).toFixed(2) : '',
        referralBonusLevel3Rate: data.referralBonusLevel3Rate != null ? (Number(data.referralBonusLevel3Rate) * 100).toFixed(2) : '',
        isDepositEnabled: data.isDepositEnabled ?? true,
        isWithdrawalEnabled: data.isWithdrawalEnabled ?? true,
      })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleToggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      minDepositAmount: Number(form.minDepositAmount || 0),
      minWithdrawalAmount: Number(form.minWithdrawalAmount || 0),
      referralBonusLevel1Rate: Number(form.referralBonusLevel1Rate || 0) / 100,
      referralBonusLevel2Rate: Number(form.referralBonusLevel2Rate || 0) / 100,
      referralBonusLevel3Rate: Number(form.referralBonusLevel3Rate || 0) / 100,
      isDepositEnabled: form.isDepositEnabled,
      isWithdrawalEnabled: form.isWithdrawalEnabled,
    }
    try {
      await adminAPI.updateSystemSettings(payload)
      toast.success('System settings updated')
      await loadSettings()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to update settings')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-950/95">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950/95 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
              <Settings className="h-7 w-7 text-emerald-400" />
              System Settings
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              Update operational limits, referral bonuses, and system toggles.
            </p>
          </div>
          <button
            onClick={loadSettings}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 via-emerald-400/15 to-sky-500/20 px-4 py-3 sm:px-6 sm:py-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-slate-950/80 p-2 shadow-md border border-emerald-500/60">
              <Settings className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-50">
                Control your platform&apos;s core behavior
              </p>
              <p className="text-xs text-emerald-100/90 mt-1">
                Adjust minimum amounts, turn deposits/withdrawals on or off, and fine‑tune referral
                bonuses without redeploying your backend.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-emerald-100/80">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1">
              Live config
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1">
              Safe limits
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 space-y-6 shadow-xl"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Operational limits</h2>
            <p className="text-xs text-slate-500">
              Set minimum thresholds to reduce spam and tiny transactions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <label key={field.key} className="text-sm text-slate-300 flex flex-col gap-1">
                {field.label}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[field.key]}
                  onChange={(e) => handleInput(field.key, e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                  required
                />
                <span className="text-xs text-slate-500">{field.helper}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-2">Referral bonuses</h2>
              <p className="text-xs text-slate-500">
                Configure multi‑level referral rewards as percentage of earnings.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {referralFields.map((field) => (
                <label key={field.key} className="text-sm text-slate-300 flex flex-col gap-1">
                  {field.label}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form[field.key]}
                      onChange={(e) => handleInput(field.key, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                      required
                    />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">
              Platform availability toggles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Enable Deposits</p>
                  <p className="text-xs text-slate-500">Allow users to create new deposits.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('isDepositEnabled')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    form.isDepositEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
                      form.isDepositEnabled ? 'right-0.5' : 'left-0.5'
                    } transition`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Enable Withdrawals</p>
                  <p className="text-xs text-slate-500">Allow users to request withdrawals.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('isWithdrawalEnabled')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    form.isWithdrawalEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
                      form.isWithdrawalEnabled ? 'right-0.5' : 'left-0.5'
                    } transition`}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            >
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

