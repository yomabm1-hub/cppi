import { useEffect, useMemo, useState } from 'react'
import { withdrawalAPI } from '../services/api'
import { AlertTriangle, ArrowUpCircle, Loader, PlugZap, Wallet, Calendar, Banknote, Gift, TrendingUp, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import useMetaMaskWallet, { METAMASK_NETWORKS } from '../hooks/useMetaMaskWallet'

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [config, setConfig] = useState(null)
  const [withdrawalStats, setWithdrawalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USDT',
    walletAddress: '',
    network: 'BEP20',
  })
  const {
    account: connectedAccount,
    chainId: connectedChainId,
    connect: connectMetaMask,
    switchNetwork: switchMetaMaskNetwork,
    connecting: connectingWallet,
    isInstalled: isMetaMaskInstalled,
    error: metaMaskError,
    clearError: clearMetaMaskError,
  } = useMetaMaskWallet()

  useEffect(() => {
    if (metaMaskError) {
      const message =
        metaMaskError?.message ||
        (metaMaskError?.code === 4001
          ? 'MetaMask connection was rejected.'
          : 'MetaMask error occurred.')
      toast.error(message)
      clearMetaMaskError()
    }
  }, [metaMaskError, clearMetaMaskError])

  useEffect(() => {
    if (!connectedAccount) return
    setFormData((prev) => {
      const current = prev.walletAddress?.toLowerCase()
      const next = connectedAccount.toLowerCase()
      if (current === next || !prev.walletAddress) {
        return { ...prev, walletAddress: connectedAccount }
      }
      return prev
    })
  }, [connectedAccount])

  const selectedNetworkMeta = useMemo(
    () => METAMASK_NETWORKS[formData.network],
    [formData.network]
  )

  const isNetworkMismatch =
    Boolean(connectedAccount && selectedNetworkMeta && connectedChainId) &&
    selectedNetworkMeta.chainIdHex !== connectedChainId

  const truncatedAccount = connectedAccount
    ? `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
    : ''

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [withdrawalsData, configResponse, statsResponse] = await Promise.all([
        withdrawalAPI.getMyWithdrawals({ limit: 50 }),
        withdrawalAPI.getConfig().catch(() => null),
        withdrawalAPI.getStats().catch(() => null),
      ])

      const withdrawalList =
        withdrawalsData?.data?.data ||
        withdrawalsData?.data?.withdrawals ||
        []
      setWithdrawals(Array.isArray(withdrawalList) ? withdrawalList : [])

      if (configResponse?.data?.data) {
        setConfig(configResponse.data.data)
      } else {
        setConfig({ minWithdrawalAmount: 10, minUsdcWithdrawalAmount: 20 })
      }

      if (statsResponse?.data?.data) {
        setWithdrawalStats(statsResponse.data.data)
      } else {
        setWithdrawalStats(null)
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error)
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await withdrawalAPI.create({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        walletAddress: formData.walletAddress,
        network: formData.network,
      })

      toast.success('Withdrawal request submitted successfully!')
      setFormData({ amount: '', currency: 'USDT', walletAddress: '', network: 'BEP20' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConnectWallet = async () => {
    try {
      const address = await connectMetaMask(formData.network)
      if (address) {
        setFormData((prev) => ({ ...prev, walletAddress: address }))
        toast.success('MetaMask wallet connected')
      }
    } catch (error) {
      if (error?.code === 4001) {
        toast.error('Connection request rejected in MetaMask')
      } else {
        toast.error(error?.message || 'Failed to connect MetaMask')
      }
    }
  }

  const handleUseConnectedAddress = () => {
    if (!connectedAccount) {
      toast.error('Connect MetaMask first to use its address')
      return
    }
    setFormData((prev) => ({ ...prev, walletAddress: connectedAccount }))
    toast.success('Wallet address filled from MetaMask')
  }

  const handleSwitchNetwork = async () => {
    if (!selectedNetworkMeta) return
    try {
      await switchMetaMaskNetwork(formData.network)
      toast.success(`Switched network to ${selectedNetworkMeta.label}`)
    } catch (error) {
      toast.error(error?.message || 'Failed to switch MetaMask network')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      APPROVED: 'bg-primary-500/20 text-primary-300 border border-primary-500/40',
      COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      REJECTED: 'bg-red-500/20 text-red-300 border border-red-500/40',
      FAILED: 'bg-red-500/20 text-red-300 border border-red-500/40',
    }
    return colors[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const minAmount = formData.currency === 'USDC'
    ? (config?.minUsdcWithdrawalAmount || 20)
    : (config?.minWithdrawalAmount || 10)

  const breakdown = withdrawalStats?.breakdown || {}
  const formatAmount = (value = 0, options = {}) => {
    const amount = Number(value) || 0
    const prefix = options.prefix ?? '$'
    const sign = options.sign || ''
    return `${sign}${prefix}${amount.toFixed(2)}`
  }

  const availableToWithdraw = formatAmount(breakdown.availableToWithdraw)

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Withdrawals</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">Request a withdrawal to your wallet</p>
      </div>

      {/* Balance & breakdown - slate card + gradient accent */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Withdrawable balance (earnings + bonuses)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-3xl sm:text-4xl font-bold text-emerald-400">{availableToWithdraw}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Daily task</span>
                </div>
                <p className="font-semibold text-emerald-400">{formatAmount(breakdown.dailyTaskEarnings, { sign: '+' })}</p>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <Gift className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Referral</span>
                </div>
                <p className="font-semibold text-emerald-400">{formatAmount(breakdown.referralBonuses, { sign: '+' })}</p>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <Banknote className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Total earned</span>
                </div>
                <p className="font-semibold text-slate-200">{formatAmount(breakdown.totalEarned)}</p>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <Send className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Total withdrawn</span>
                </div>
                <p className="font-semibold text-red-400">{formatAmount(breakdown.totalWithdrawn, { sign: '-' })}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
          <p className="text-sm text-slate-400">
            Available to withdraw: <span className="font-semibold text-slate-50">{availableToWithdraw}</span>
            {' · '}
            <span className="text-slate-500">Deposits ({formatAmount(breakdown.depositsTotal)}) can only be used for VIP purchases.</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Withdrawal Form - slate card */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary-400" />
            Request Withdrawal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Network</label>
              <select
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              >
                <option value="BEP20">BSC (BEP20)</option>
                <option value="POLYGON">Polygon</option>
                <option value="ARBITRUM">Arbitrum</option>
                <option value="OPTIMISM">Optimism</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-amber-400" />
                    MetaMask Wallet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isMetaMaskInstalled
                      ? connectedAccount
                        ? `Connected: ${truncatedAccount}`
                        : 'Connect MetaMask to fill your withdrawal address automatically.'
                      : 'MetaMask is not detected. Install the browser extension to enable one-click withdrawals.'}
                  </p>
                  {connectedAccount && selectedNetworkMeta && (
                    <p className="text-xs text-slate-400 mt-1">
                      Target network: {selectedNetworkMeta.label}
                      {isNetworkMismatch && (
                        <span className="text-amber-400 font-medium ml-1">(switch required)</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={connectingWallet || !isMetaMaskInstalled}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {connectingWallet ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlugZap className="h-4 w-4" />
                    )}
                    {connectedAccount ? 'Refresh Wallet' : 'Connect MetaMask'}
                  </button>
                  {isNetworkMismatch && (
                    <button
                      type="button"
                      onClick={handleSwitchNetwork}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
                    >
                      Switch Network
                    </button>
                  )}
                </div>
              </div>
              {!isMetaMaskInstalled && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 underline mt-2 inline-block"
                >
                  Install MetaMask
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount (Min: ${minAmount})
              </label>
              <input
                type="number"
                step="0.01"
                min={minAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder={`Enter amount (min $${minAmount})`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address</label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Enter your wallet address"
                required
              />
              <button
                type="button"
                onClick={handleUseConnectedAddress}
                className="mt-2 text-sm font-medium text-primary-400 hover:text-primary-300"
              >
                Use connected MetaMask address
              </button>
              {isNetworkMismatch && (
                <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Connected wallet is on a different network. Please switch before requesting a withdrawal.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || parseFloat(formData.amount) < minAmount}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ArrowUpCircle className="h-5 w-5" />
                  Request Withdrawal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Withdrawal History - slate card */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Withdrawal History</h2>
          {withdrawals.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No withdrawals yet</p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-50">
                      {withdrawal.amount} {withdrawal.currency}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        withdrawal.status
                      )}`}
                    >
                      {withdrawal.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Network: {withdrawal.network || 'N/A'}</p>
                    <p>Date: {formatDate(withdrawal.createdAt)}</p>
                    {withdrawal.feeAmount > 0 && (
                      <p>Fee: ${parseFloat(withdrawal.feeAmount).toFixed(2)}</p>
                    )}
                    {withdrawal.transactionHash && (
                      <p className="text-xs break-all text-slate-500">
                        Hash: {withdrawal.transactionHash.substring(0, 30)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
