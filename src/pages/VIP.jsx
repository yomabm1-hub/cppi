import { useEffect, useState } from 'react'
import { vipAPI, referralAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Copy,
  Check,
  Calendar,
  Medal,
  ChevronRight,
  Play,
  Crown,
  TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Simple social share icon components (inline SVG)
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)
const LinkedInIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const SOCIAL_SHARES = [
  { name: 'X', Icon: XIcon, url: (link, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text || '')}` },
  { name: 'Facebook', Icon: FacebookIcon, url: (link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}` },
  { name: 'Telegram', Icon: TelegramIcon, url: (link, text) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text || '')}` },
  { name: 'LinkedIn', Icon: LinkedInIcon, url: (link) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}` },
  { name: 'WhatsApp', Icon: WhatsAppIcon, url: (link, text) => `https://wa.me/?text=${encodeURIComponent((text || '') + ' ' + link)}` },
]

export default function VIP() {
  const { user } = useAuth()
  const [levels, setLevels] = useState([])
  const [status, setStatus] = useState(null)
  const [referralStats, setReferralStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [starting, setStarting] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [levelsRes, statusRes, referralRes] = await Promise.all([
        vipAPI.getLevels(),
        vipAPI.getStatus(),
        referralAPI.getStats().catch(() => ({ data: { data: null } })),
      ])
      setLevels(levelsRes.data.data || [])
      setStatus(statusRes.data?.data || statusRes.data)
      setReferralStats(referralRes.data?.data || null)
    } catch (error) {
      toast.error('Failed to load VIP data')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (vipLevelId) => {
    if (!confirm('Are you sure you want to join this VIP level?')) return
    setJoining(true)
    try {
      await vipAPI.join(vipLevelId)
      toast.success('Successfully joined VIP level!')
      loadData()
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to join VIP level'
      toast.error(message)
    } finally {
      setJoining(false)
    }
  }

  const handleStartEarning = async () => {
    setStarting(true)
    try {
      await vipAPI.startEarning()
      toast.success('Earning session started!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start earning session')
    } finally {
      setStarting(false)
    }
  }

  const referralCode = referralStats?.referralCode || user?.referralCode || '------'
  const referralLink = referralStats?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/#/register?ref=${referralCode}` : '')

  const copyCode = () => {
    if (referralCode && referralCode !== '------') {
      navigator.clipboard.writeText(referralCode)
      setCopiedCode(true)
      toast.success('Invitation code copied!')
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      setCopiedLink(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const shareUrl = (getUrl) => {
    const url = getUrl(referralLink, 'Join me on CP-Investment')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Team stats from referral data
  const teamSize = referralStats?.totalReferrals ?? 0
  const newTeam = referralStats?.directReferrals ?? 0
  const teamRecharge = referralStats?.totalBonuses != null ? parseFloat(referralStats.totalBonuses) : 0
  const firstTimeRecharge = referralStats?.directReferrals ?? 0
  const level1Rate = ((referralStats?.level1Rate ?? 0.1) * 100)
  const level2Rate = ((referralStats?.level2Rate ?? 0.05) * 100)
  const level3Rate = ((referralStats?.level3Rate ?? 0.02) * 100)
  const recentBonuses = referralStats?.recentBonuses || []
  const incomeL1 = recentBonuses.filter(b => b.level === 1).reduce((s, b) => s + parseFloat(b.bonusAmount || 0), 0)
  const incomeL2 = recentBonuses.filter(b => b.level === 2).reduce((s, b) => s + parseFloat(b.bonusAmount || 0), 0)
  const incomeL3 = recentBonuses.filter(b => b.level === 3).reduce((s, b) => s + parseFloat(b.bonusAmount || 0), 0)
  const totalBonuses = parseFloat(referralStats?.totalBonuses || 0)
  const validL1 = referralStats?.directReferrals ?? 0
  const validL2 = referralStats?.indirectReferrals ?? 0
  const validL3 = Math.max(0, teamSize - validL1 - validL2)

  const currentVip = status?.userVip
  const currentLevelAmount = parseFloat(currentVip?.vipLevel?.amount ?? currentVip?.totalPaid ?? 0)
  const activeSession = status?.activeSession

  // Selection period label (e.g. current month)
  const selectionPeriod = (() => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Invitation / Referral card - warm orange */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-5 sm:p-6 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Invitation code:</p>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-xl font-bold tracking-wide">{referralCode}</span>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-sm font-medium hover:bg-white transition-colors"
          >
            {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Share your referral link and start earning</p>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-sm text-slate-800/90 break-all flex-1 min-w-0">{referralLink || 'Loading...'}</span>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-sm font-medium hover:bg-white transition-colors shrink-0"
          >
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {SOCIAL_SHARES.map(({ name, Icon, url }) => (
            <button
              key={name}
              onClick={() => shareUrl(url)}
              className="p-2 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 transition-colors"
              title={`Share on ${name}`}
              aria-label={`Share on ${name}`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Team statistics card - light grey/green tint */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-slate-300 mb-4">
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium">Selection period</span>
          <span className="text-slate-400 text-sm">({selectionPeriod})</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-0.5">Team size</p>
            <p className="text-xl font-bold text-slate-50">{teamSize}</p>
            <p className="text-xs text-slate-400 mt-1">New team</p>
            <p className="text-lg font-semibold text-slate-200">{newTeam}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-0.5">Team recharge</p>
            <p className="text-xl font-bold text-emerald-400">${teamRecharge.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">First time recharge</p>
            <p className="text-lg font-semibold text-slate-200">{firstTimeRecharge}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-0.5">Team withdrawal</p>
            <p className="text-xl font-bold text-slate-50">—</p>
            <p className="text-xs text-slate-400 mt-1">First withdrawal</p>
            <p className="text-lg font-semibold text-slate-200">—</p>
          </div>
        </div>
      </div>

      {/* Level performance cards - gradient cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {[
          { level: 1, label: 'LEVEL 1', valid: validL1, total: validL1, commission: level1Rate, income: totalBonuses > 0 && incomeL1 + incomeL2 + incomeL3 === 0 ? totalBonuses / 3 : incomeL1, gradient: 'from-teal-500 via-emerald-500 to-green-600' },
          { level: 2, label: 'LEVEL 2', valid: validL2, total: validL2, commission: level2Rate, income: totalBonuses > 0 && incomeL1 + incomeL2 + incomeL3 === 0 ? totalBonuses / 3 : incomeL2, gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
          { level: 3, label: 'LEVEL 3', valid: validL3, total: validL3, commission: level3Rate, income: totalBonuses > 0 && incomeL1 + incomeL2 + incomeL3 === 0 ? totalBonuses / 3 : incomeL3, gradient: 'from-pink-500 via-rose-500 to-red-500' },
        ].map(({ level, label, valid, total, commission, income, gradient }) => (
          <div
            key={level}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl p-5 border border-white/20`}
          >
            <div className="absolute top-3 left-3">
              <Medal className="h-6 w-6 text-white/90" />
            </div>
            <div className="pt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                Register/Valid {total}/{valid}
              </p>
              <p className="text-sm text-white/90">
                Commission percentage <span className="font-bold">{commission}%</span>
              </p>
              <p className="text-sm text-white/90">
                Total income <span className="font-bold">{income.toFixed(6)}</span>
              </p>
            </div>
            <a
              href="/referrals"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
            >
              Details
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      {/* Current VIP status & Start earning - compact */}
      {currentVip && (
        <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Current VIP Level</h2>
                <p className="text-sm text-purple-100/90">{currentVip.vipLevel?.name || 'N/A'}</p>
                <p className="text-sm text-purple-100 mt-0.5">
                  Daily earning: <span className="font-semibold">${parseFloat(currentVip.vipLevel?.dailyEarning || 0).toFixed(2)}/day</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-purple-100/80">Total Paid</p>
                <p className="text-2xl font-bold">${parseFloat(currentVip.totalPaid || 0).toFixed(2)}</p>
              </div>
              {activeSession ? (
                <p className="text-xs text-purple-100 flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  Earning session active
                </p>
              ) : (
                <button
                  onClick={handleStartEarning}
                  disabled={starting}
                  className="inline-flex items-center justify-center rounded-lg bg-white text-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors"
                >
                  {starting ? 'Starting...' : 'Start Earning'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIP Levels - join/upgrade cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          VIP Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {levels.map((level) => {
            const isCurrentLevel = currentVip?.vipLevelId === level.id
            const levelAmount = parseFloat(level.amount)
            const canUpgrade = !currentVip || levelAmount > currentLevelAmount

            return (
              <div
                key={level.id}
                className={`relative overflow-hidden rounded-2xl border p-5 bg-slate-900/90 border-slate-800 flex flex-col ${
                  isCurrentLevel ? 'ring-2 ring-purple-500/70 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-50">{level.name}</h3>
                  {isCurrentLevel && (
                    <span className="px-2.5 py-1 text-[11px] font-medium bg-purple-500/20 text-purple-100 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-400">Investment</p>
                  <p className="text-2xl font-bold text-slate-50">${parseFloat(level.amount).toFixed(2)}</p>
                  <p className="text-sm text-emerald-300">
                    ${parseFloat(level.dailyEarning).toFixed(2)}/day
                  </p>
                </div>
                {!isCurrentLevel && (
                  <button
                    onClick={() => handleJoin(level.id)}
                    disabled={joining || !canUpgrade}
                    className={`w-full flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      canUpgrade ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {joining ? 'Processing...' : canUpgrade ? (<> <TrendingUp className="mr-2 h-4 w-4" /> Upgrade </>) : 'Upgrade not available'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
