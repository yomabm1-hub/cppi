import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import {
  Shield,
  Users,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Crown,
  Settings,
  Wallet,
  DollarSign,
  PiggyBank,
  Banknote,
  RefreshCw,
} from 'lucide-react'

const currency = (value = 0, options = {}) => {
  const amount = Number(value) || 0
  const prefix = options.prefix ?? '$'
  const sign = options.sign || ''
  return `${sign}${prefix}${amount.toFixed(2)}`
}

const statCards = (stats) => [
  {
    label: 'Total Users',
    value: stats?.totalUsers || 0,
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Active Users',
    value: stats?.activeUsers || 0,
    icon: Activity,
    color: 'bg-green-100 text-green-600',
  },
  {
    label: 'VIP Members',
    value: stats?.vipUsers || 0,
    icon: Crown,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'System Balance',
    value: currency(stats?.systemBalance),
    icon: Wallet,
    color: 'bg-amber-100 text-amber-600',
  },
]

const quickActions = [
  {
    title: 'Manage Users',
    description: 'View, search and toggle user status.',
    icon: Users,
    actionLabel: 'Open Manager',
    href: '/admin/users',
  },
  {
    title: 'Manage Deposits',
    description: 'Monitor confirmed and pending deposits.',
    icon: ArrowDownCircle,
    actionLabel: 'Review Deposits',
    href: '/admin/deposits',
  },
  {
    title: 'Manage Withdrawals',
    description: 'Approve or reject withdrawal requests.',
    icon: ArrowUpCircle,
    actionLabel: 'Review Withdrawals',
    href: '/admin/withdrawals',
  },
  {
    title: 'VIP Levels & Members',
    description: 'Edit VIP tiers and view member list.',
    icon: Crown,
    actionLabel: 'Manage VIPs',
    href: '/admin/vips',
  },
  {
    title: 'System Settings',
    description: 'Update operational toggles and limits.',
    icon: Settings,
    actionLabel: 'Edit Settings',
    href: '/admin/system-settings',
  },
  {
    title: 'Withdrawal Fees',
    description: 'Configure tiered withdrawal fee structure.',
    icon: Banknote,
    actionLabel: 'Adjust Fees',
    href: '/admin/withdrawal-fees',
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to load admin stats:', error)
      toast.error(error.response?.data?.message || 'Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const depositSummary = [
    {
      label: 'Total Deposits',
      value: currency(stats?.totalDeposits),
      sub: `${stats?.depositCount || 0} records`,
    },
    {
      label: 'Confirmed Deposits',
      value: currency(stats?.confirmedDeposits),
      sub: `${stats?.depositCount || 0} total`,
    },
    {
      label: 'Pending Deposits',
      value: currency(stats?.pendingDeposits),
      sub: `${stats?.pendingDepositCount || 0} pending`,
    },
  ]

  const withdrawalSummary = [
    {
      label: 'Total Withdrawals',
      value: currency(stats?.totalWithdrawals),
      sub: `${stats?.withdrawalCount || 0} records`,
    },
    {
      label: 'Completed Withdrawals',
      value: currency(stats?.completedWithdrawals),
      sub: `${stats?.withdrawalCount || 0} total`,
    },
    {
      label: 'Pending Withdrawals',
      value: currency(stats?.pendingWithdrawals),
      sub: `${stats?.pendingWithdrawalCount || 0} pending`,
    },
  ]

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary-400" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Monitor system health, member activity, and manage platform controls.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="btn-secondary w-full md:w-auto bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
        >
          <RefreshCw className="inline-block h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Info strip */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Admin control center</p>
        <p className="text-sm text-slate-800/90">
          Review live metrics, liquidity, and critical management tools for the platform in one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards(stats).map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-50 break-all">
                  {card.value}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-full shrink-0 bg-primary-500/20 border border-primary-500/40 text-primary-300">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Financial overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Deposits</h2>
            <ArrowDownCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            {depositSummary.map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl bg-slate-900/60 border border-slate-700"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-50">{item.value}</p>
                </div>
                <span className="text-xs text-slate-400">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Withdrawals</h2>
            <ArrowUpCircle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="space-y-3">
            {withdrawalSummary.map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl bg-slate-900/60 border border-slate-700"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-50">{item.value}</p>
                </div>
                <span className="text-xs text-slate-400">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings snapshot */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Earnings Snapshot</h2>
          <PiggyBank className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-600/40 to-teal-500/40 border border-emerald-400/50">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Wallet Balance</p>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-white">
              {currency(stats?.totalWalletBalance)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/30 via-sky-600/40 to-cyan-500/40 border border-sky-400/50">
            <p className="text-xs uppercase tracking-wide text-sky-100">Task Earnings</p>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-white">
              {currency(stats?.totalEarnings)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/30 via-purple-600/40 to-pink-500/40 border border-fuchsia-400/50">
            <p className="text-xs uppercase tracking-wide text-fuchsia-100">Referral Bonus</p>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-white">
              {currency(stats?.totalReferralBonus)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-400">Today’s Flow</p>
            <p className="mt-2 text-base sm:text-lg font-semibold text-slate-50 flex items-center gap-2">
              <DollarSign className="h-5 w-5 shrink-0 text-emerald-400" />
              {currency((stats?.todayDeposits || 0) - (stats?.todayWithdrawals || 0))}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Deposits {currency(stats?.todayDeposits)} · Withdrawals {currency(stats?.todayWithdrawals)}
            </p>
          </div>
        </div>
      </div>

      {/* Management hub */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Management Hub</h2>
          <span className="text-xs uppercase tracking-wide text-slate-400">Admin tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <div
                key={action.title}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 p-4 flex flex-col h-full shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-primary-300 border border-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">
                    Admin
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-50">{action.title}</h3>
                <p className="text-sm text-slate-400 mt-1 flex-1">{action.description}</p>
                {action.href ? (
                  <Link
                    to={action.href}
                    className="mt-4 w-full btn-secondary bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 text-center block"
                  >
                    {action.actionLabel}
                  </Link>
                ) : (
                  <button
                    onClick={() => toast('This management view is coming soon.')}
                    className="mt-4 w-full btn-secondary bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700"
                  >
                    {action.actionLabel}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Tip: Management sections are being rolled out incrementally. Use the quick actions to
          access each area as soon as it becomes available.
        </p>
      </div>
    </div>
  )
}

