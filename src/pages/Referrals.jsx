import { useEffect, useState } from 'react'
import { referralAPI } from '../services/api'
import { Users, Gift, Copy, Check, TrendingUp, Calendar, Medal } from 'lucide-react'
import toast from 'react-hot-toast'

// Social share icon components (match VIP page)
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

export default function Referrals() {
  const [stats, setStats] = useState(null)
  const [directReferrals, setDirectReferrals] = useState([])
  const [indirectReferrals, setIndirectReferrals] = useState([])
  const [bonuses, setBonuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await referralAPI.getStats()
      const data = response.data.data

      setStats(data)
      setDirectReferrals(data.directReferralList || [])
      setIndirectReferrals(data.indirectReferralList || [])
      setBonuses(data.recentBonuses || [])
    } catch (error) {
      toast.error('Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopiedLink(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleCopyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode)
      setCopiedCode(true)
      toast.success('Invitation code copied!')
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const shareUrl = (getUrl) => {
    const link = stats?.referralLink || ''
    if (!link) return
    const url = getUrl(link, 'Join me on CP-Investment')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const referralCode = stats?.referralCode || '------'
  const referralLink = stats?.referralLink || ''

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Referral Program</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">Earn commissions from your referrals</p>
      </div>

      {/* Invitation card - warm orange (same as VIP) */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-5 sm:p-6 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Invitation code:</p>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-xl font-bold tracking-wide">{referralCode}</span>
          <button
            onClick={handleCopyCode}
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
            onClick={handleCopyLink}
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

      {/* Team stats - slate card (same as VIP) */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-slate-300 mb-4">
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium">Selection period</span>
          <span className="text-slate-400 text-sm">
            ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">{stats?.totalReferrals || 0}</p>
          </div>
          <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Gift className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Total Bonuses</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${parseFloat(stats?.totalBonuses || 0).toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Level 1</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">{stats?.directReferrals || 0}</p>
          </div>
          <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Level 2</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">{stats?.indirectReferrals || 0}</p>
          </div>
        </div>
      </div>

      {/* Commission rates - gradient cards (same as VIP level cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {[
          { level: 1, label: 'Level 1 (Direct)', rate: (stats?.level1Rate ?? 0.1) * 100, gradient: 'from-teal-500 via-emerald-500 to-green-600' },
          { level: 2, label: 'Level 2 (Indirect)', rate: (stats?.level2Rate ?? 0.05) * 100, gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
          { level: 3, label: 'Level 3', rate: (stats?.level3Rate ?? 0.02) * 100, gradient: 'from-pink-500 via-rose-500 to-red-500' },
        ].map(({ level, label, rate, gradient }) => (
          <div
            key={level}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl p-5 border border-white/20`}
          >
            <div className="absolute top-3 left-3">
              <Medal className="h-6 w-6 text-white/90" />
            </div>
            <div className="pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">{label}</p>
              <p className="text-3xl font-bold text-white">{rate.toFixed(0)}%</p>
              <p className="text-sm text-white/80 mt-1">Commission</p>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Referrals table - dark theme */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-50 px-5 py-4 border-b border-slate-700">Direct Referrals (Level 1)</h2>
        {directReferrals.length === 0 ? (
          <p className="text-slate-400 text-center py-12">No direct referrals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/60">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">VIP Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Deposits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Bonus Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {directReferrals.map((referral) => (
                  <tr key={referral.id} className="bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-50">
                        {referral.fullName || referral.email || referral.phone || 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(referral.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{referral.userVip?.vipLevel?.name || 'No VIP'}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">${parseFloat(referral.wallet?.totalDeposits || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-400">${parseFloat(referral.referralBonusFromUser || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Bonuses - dark theme */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-50 mb-4">Recent Bonuses</h2>
        {bonuses.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No bonuses yet</p>
        ) : (
          <div className="space-y-3">
            {bonuses.map((bonus) => (
              <div
                key={bonus.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-700"
              >
                <div>
                  <p className="font-medium text-slate-50">
                    From: {bonus.referred?.fullName || bonus.referred?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-400">
                    Level {bonus.level} • {formatDate(bonus.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">+${parseFloat(bonus.bonusAmount).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Rate: {((bonus.bonusRate || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
