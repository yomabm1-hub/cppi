import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { walletAPI, vipAPI, referralAPI, announcementAPI } from '../services/api'
import {
  Wallet,
  TrendingUp,
  Users,
  Crown,
  ArrowRight,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  PiggyBank,
  Activity,
  Megaphone,
  CheckCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import toast from 'react-hot-toast'

const currency = (value = 0) => {
  const amount = Number(value) || 0
  return `$${amount.toFixed(2)}`
}

export default function Dashboard() {
  const [walletStats, setWalletStats] = useState(null)
  const [vipStatus, setVipStatus] = useState(null)
  const [vipLevels, setVipLevels] = useState([])
  const [referralStats, setReferralStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])
  const [announcementLoading, setAnnouncementLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setAnnouncementLoading(true)
    try {
      const [wallet, vip, referral, levels, announcementRes] = await Promise.all([
        walletAPI.getStats().catch(() => null),
        vipAPI.getStatus().catch(() => null),
        referralAPI.getStats().catch(() => null),
        vipAPI.getLevels().catch(() => null),
        announcementAPI.getActive().catch(() => null),
      ])

      if (wallet?.data?.data) {
        setWalletStats(wallet.data.data)
      }
      if (vip?.data?.data) {
        setVipStatus(vip.data.data)
      }
      if (levels?.data?.data) {
        setVipLevels(levels.data.data)
      }
      if (referral?.data?.data) {
        setReferralStats(referral.data.data)
      }
      if (announcementRes?.data?.data) {
        setAnnouncements(announcementRes.data.data)
      } else {
        setAnnouncements([])
      }
      setAnnouncementLoading(false)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setAnnouncementLoading(false)
      setLoading(false)
    }
  }

  const handleAnnouncementRead = async (announcementId) => {
    try {
      await announcementAPI.markRead(announcementId)
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === announcementId ? { ...item, isRead: true } : item))
      )
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update announcement')
    }
  }

  const handleMarkAllAnnouncements = async () => {
    const unread = announcements.filter((item) => !item.isRead)
    await Promise.all(unread.map((item) => announcementAPI.markRead(item.id).catch(() => null)))
    setAnnouncements((prev) => prev.map((item) => ({ ...item, isRead: true })))
    toast.success('All announcements acknowledged')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Wallet Balance',
      value: currency(walletStats?.balance || 0),
      icon: Wallet,
      color: 'bg-blue-100 text-blue-600',
      link: '/wallet',
    },
    {
      label: 'Total Deposits',
      value: currency(walletStats?.totalDeposits || 0),
      icon: ArrowDownCircle,
      color: 'bg-green-100 text-green-600',
      link: '/deposits',
    },
    {
      label: 'Total Earnings',
      value: currency(walletStats?.totalEarnings || 0),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      link: '/transactions',
    },
    {
      label: 'Referral Bonuses',
      value: currency(walletStats?.totalReferralBonus || 0),
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      link: '/referrals',
    },
  ]

  const currentVip = vipStatus?.userVip
  const currentLevelAmount = currentVip?.vipLevel?.amount
    ? parseFloat(currentVip.vipLevel.amount)
    : null
  const nextLevel = vipLevels
    .filter((level) => !currentLevelAmount || parseFloat(level.amount) > currentLevelAmount)
    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0]

  const recentTransactions = Array.isArray(walletStats?.recentTransactions) ? walletStats.recentTransactions : []
  const chartData = recentTransactions
    .slice()
    .reverse()
    .map((txn) => {
      const rawAmount = Number(txn.amount) || 0
      const isOutflow = ['WITHDRAWAL', 'VIP_PAYMENT'].includes(txn.type)
      const value = isOutflow ? -Math.abs(rawAmount) : Math.abs(rawAmount)
      return {
        id: txn.id,
        date: new Date(txn.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        value: Number(value.toFixed(2)),
        type: txn.type,
        description: txn.description,
      }
    })

  const totalInflow = chartData.reduce((sum, item) => (item.value > 0 ? sum + item.value : sum), 0)
  const totalOutflow = chartData.reduce((sum, item) => (item.value < 0 ? sum + Math.abs(item.value) : sum), 0)
  const netFlow = totalInflow - totalOutflow

  const quickActions = [
    {
      title: 'Make a Deposit',
      description: 'Add funds to your account',
      icon: ArrowDownCircle,
      href: '/deposits',
    },
    {
      title: 'Request Withdrawal',
      description: 'Withdraw your earnings',
      icon: ArrowUpCircle,
      href: '/withdrawals',
    },
    ...(!vipStatus?.userVip
      ? [
          {
            title: 'Join VIP Program',
            description: 'Unlock daily earnings',
            icon: Crown,
            href: '/vip',
          },
        ]
      : []),
  ]

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Welcome back! Here's your account overview and quick actions.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 text-sm font-medium border border-slate-700 shadow-sm transition-colors w-full md:w-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Announcement Center */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/60 shadow-xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-300">
              <Megaphone className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">Announcements</p>
            </div>
            <p className="text-sm text-slate-300">
              Stay updated with platform-wide alerts from the CP-Investment team.
            </p>
          </div>
          {announcements.some((item) => !item.isRead) && (
            <button
              onClick={handleMarkAllAnnouncements}
              className="text-sm font-medium text-primary-300 hover:text-primary-200"
            >
              Mark all as read
            </button>
          )}
        </div>

        {announcementLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No announcements at this time.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${
                  announcement.priority === 'URGENT'
                    ? 'border-red-500/60 bg-red-950/40'
                    : announcement.priority === 'HIGH'
                    ? 'border-amber-400/60 bg-amber-950/30'
                    : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span
                        className={`rounded-full px-2 py-1 ${
                          announcement.priority === 'URGENT'
                            ? 'bg-red-500/20 text-red-300'
                            : announcement.priority === 'HIGH'
                            ? 'bg-amber-400/20 text-amber-200'
                            : 'bg-primary-500/20 text-primary-200'
                        }`}
                      >
                        {announcement.priority}
                      </span>
                      {announcement.isPinned && (
                        <span className="rounded-full bg-purple-500/20 px-2 py-1 text-purple-200">
                          Pinned
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-50">{announcement.title}</h3>
                    <p className="text-sm text-slate-200 whitespace-pre-line">{announcement.message}</p>
                    {announcement.ctaUrl && (
                      <a
                        href={announcement.ctaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-sm font-semibold text-primary-300 hover:text-primary-200"
                      >
                        {announcement.ctaLabel || 'Open details'}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {announcement.isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                        <CheckCircle className="h-4 w-4" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAnnouncementRead(announcement.id)}
                        className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800/80"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top overview row: balance + VIP */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Wallet & KPIs */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Wallet Balance</p>
              <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-50">
                {currency(walletStats?.balance || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Total earnings and deposits combined.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {statCards.slice(1).map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className="min-w-[140px] rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {card.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-50 break-all">
                        {card.value}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-full bg-slate-800 text-slate-100 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick actions inline for desktop */}
          <div className="hidden lg:grid grid-cols-3 gap-3 mt-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex items-center justify-between hover:border-primary-500 hover:bg-slate-900 transition-all"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{action.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* VIP Upgrade (or placeholder) */}
        <div className="space-y-4">
          {nextLevel && (
            <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white shadow-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center mb-2">
                    <Crown className="h-5 w-5 mr-2" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      Next VIP Upgrade
                    </h3>
                  </div>
                  <p className="text-lg font-semibold">{nextLevel.name}</p>
                  <p className="mt-1 text-xs text-purple-100/90">
                    Required{' '}
                    <span className="font-semibold">
                      {currency(nextLevel.amount)}
                    </span>{' '}
                    · Daily earning{' '}
                    <span className="font-semibold">
                      {currency(nextLevel.dailyEarning)}/day
                    </span>
                  </p>
                  {currentLevelAmount !== null && (
                    <p className="mt-2 text-[11px] text-purple-100/80">
                      Current: {currentVip?.vipLevel?.name} ({currency(currentLevelAmount)})
                    </p>
                  )}
                </div>
                <Link
                  to="/vip"
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-white text-purple-600 px-4 py-2 text-xs font-semibold hover:bg-purple-50 transition-colors"
                >
                  Upgrade
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Mobile quick actions stack */}
          <div className="lg:hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-50">Quick Actions</h2>
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                Get started
              </span>
            </div>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 hover:border-primary-500 hover:bg-slate-900 transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-100">
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Account Summary</h2>
            <PiggyBank className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-slate-800/80 rounded-xl">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Total Deposits</p>
                <p className="text-lg font-semibold text-slate-50">
                  {currency(walletStats?.totalDeposits || 0)}
                </p>
              </div>
              <span className="text-xs text-slate-400">All time</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-slate-800/80 rounded-xl">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Total Earnings</p>
                <p className="text-lg font-semibold text-slate-50">
                  {currency(walletStats?.totalEarnings || 0)}
                </p>
              </div>
              <span className="text-xs text-slate-400">From tasks</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-slate-800/80 rounded-xl">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Referral Bonuses</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currency(walletStats?.totalReferralBonus || 0)}
                </p>
              </div>
              <span className="text-xs text-slate-400">From referrals</span>
            </div>
          </div>
        </div>

        {/* Referral Info */}
        {referralStats && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Referral Program</h2>
              <Users className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-slate-800/80 rounded-xl">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total Referrals</p>
                  <p className="text-lg font-semibold text-slate-50">
                    {referralStats.totalReferrals || 0}
                  </p>
                </div>
                <span className="text-xs text-slate-400">Active members</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 bg-slate-800/80 rounded-xl">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total Bonuses</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {currency(referralStats.totalBonuses || 0)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">Earned</span>
              </div>
              <Link
                to="/referrals"
                className="block mt-4 w-full rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold text-center py-2.5 shadow-md transition-colors"
              >
                View Referrals
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Quick Actions</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">Get started</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                to={action.href}
                className="border border-slate-700 rounded-xl p-4 bg-slate-800/80 flex flex-col h-full hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-900/80 text-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-50">{action.title}</h3>
                <p className="text-sm text-slate-300 mt-1 flex-1">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Insights & Statistics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 xl:col-span-2 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-50">Insights & Statistics</h2>
              <p className="text-sm text-slate-400">Recent inflow/outflow trends from your activity</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-gray-500">Last {chartData.length} records</span>
          </div>
          {chartData.length ? (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="text-slate-800" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value, _name, payload) => [
                      currency(value),
                      payload?.payload?.value > 0 ? 'Inflow' : 'Outflow',
                    ]}
                    labelFormatter={(label, payload) => `${label} · ${payload?.[0]?.payload?.type || ''}`}
                    contentStyle={{ borderRadius: '0.75rem', borderColor: '#1f2937', backgroundColor: '#020617', color: '#e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInflow)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400 bg-slate-800/80 rounded-xl">
              Not enough history yet to build insights. Complete a transaction to get started.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Net Flow</p>
              <p className="mt-1 text-2xl font-semibold text-slate-50">{currency(netFlow)}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-300">Total Inflow</p>
                <p className="text-lg font-semibold text-emerald-200">{currency(totalInflow)}</p>
              </div>
              <ArrowDownCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/15">
              <div>
                <p className="text-xs uppercase tracking-wide text-rose-300">Total Outflow</p>
                <p className="text-lg font-semibold text-rose-200">{currency(totalOutflow)}</p>
              </div>
              <ArrowUpCircle className="h-5 w-5 text-rose-500 rotate-180" />
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 text-sm text-slate-300 leading-relaxed">
              Insights help you visualize how deposits, withdrawals, and earnings impact your balance. Keep an eye on
              the net flow to stay on track with your goals.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

