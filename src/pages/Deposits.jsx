import { useEffect, useRef, useState } from 'react'
import { depositAPI } from '../services/api'
import { Copy, Check, Loader, Wallet, ArrowDownCircle, Calendar, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [companyAddresses, setCompanyAddresses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('new')
  const [depositForm, setDepositForm] = useState({
    amount: '',
    transactionHash: '',
    network: 'BEP20',
  })
  const [autoFillData, setAutoFillData] = useState(null)
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [creatingDeposit, setCreatingDeposit] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(null)
  const [lastAutoFilledHash, setLastAutoFilledHash] = useState(null)
  const autoFillTimeoutRef = useRef(null)

  const allowedNetworks = ['BEP20', 'POLYGON']

  const normalizeNetworkValue = (value) => {
    if (!value) return 'BEP20'
    const upperValue = value.toUpperCase()
    return allowedNetworks.includes(upperValue) ? upperValue : 'BEP20'
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [depositsData, addressesData] = await Promise.all([
        depositAPI.getMyDeposits({ limit: 50 }),
        depositAPI.getCompanyAddresses(),
      ])

      setDeposits(depositsData.data.data || [])
      setCompanyAddresses(addressesData.data.data || {})
    } catch (error) {
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = (address, network) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(network)
    toast.success('Address copied!')
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleAutoFill = async (hashOverride) => {
    const normalizedHash = (hashOverride || depositForm.transactionHash || '')
      .trim()
      .replace(/\s/g, '')

    if (!normalizedHash) {
      toast.error('Please enter transaction hash')
      return
    }

    if (normalizedHash.length < 64) {
      toast.error('Transaction hash seems incomplete')
      return
    }

    setAutoFillLoading(true)
    setAutoFillData(null)

    try {
      const response = await depositAPI.autoFillTransaction(normalizedHash)
      const data = response.data.data

      setDepositForm((prev) => ({
        ...prev,
        amount: data.suggestedAmount?.toString() || '',
        network: normalizeNetworkValue(data.suggestedNetwork || prev.network),
      }))

      setAutoFillData(data)
      setLastAutoFilledHash(normalizedHash)

      if (data.verificationStatus?.canAutoFill) {
        toast.success('Transaction verified and amount auto-filled!')
      } else if (data.isRecipientMatching === false) {
        toast.error('Transaction was not sent to our wallet address')
      } else {
        toast.error('Unable to auto-fill amount. Please confirm the blockchain transaction.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch transaction')
      setLastAutoFilledHash(null)
    } finally {
      setAutoFillLoading(false)
    }
  }

  useEffect(() => {
    const hash = depositForm.transactionHash.trim()

    if (autoFillTimeoutRef.current) {
      clearTimeout(autoFillTimeoutRef.current)
      autoFillTimeoutRef.current = null
    }

    if (!hash) {
      setAutoFillData(null)
      setLastAutoFilledHash(null)
      return
    }

    if (hash.length < 64) {
      setAutoFillData(null)
      setLastAutoFilledHash(null)
      return
    }

    if (hash === lastAutoFilledHash || autoFillLoading) {
      return
    }

    autoFillTimeoutRef.current = setTimeout(() => {
      handleAutoFill(hash)
      autoFillTimeoutRef.current = null
    }, 800)

    return () => {
      if (autoFillTimeoutRef.current) {
        clearTimeout(autoFillTimeoutRef.current)
        autoFillTimeoutRef.current = null
      }
    }
  }, [depositForm.transactionHash, autoFillLoading, lastAutoFilledHash])

  const handleCreateDeposit = async () => {
    if (!autoFillData?.verificationStatus?.canAutoFill) {
      toast.error('Please auto-fill a valid transaction before creating a deposit')
      return
    }

    setCreatingDeposit(true)
    try {
      const response = await depositAPI.createUsdt({
        amount: parseFloat(depositForm.amount),
        network: normalizeNetworkValue(depositForm.network),
        transactionHash: depositForm.transactionHash.trim(),
        status: 'PENDING',
        autoConfirmed: false,
      })

      toast.success('Deposit created successfully!')
      setDepositForm({ amount: '', transactionHash: '', network: 'BEP20' })
      setAutoFillData(null)
      loadData()
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details?.message ||
        error.message ||
        'Failed to create deposit'
      console.error('Deposit creation failed:', error.response?.data || error)
      toast.error(errorMessage)
    } finally {
      setCreatingDeposit(false)
    }
  }

  const isAutoFillReady = Boolean(autoFillData?.verificationStatus?.canAutoFill)

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      CONFIRMED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      FAILED: 'bg-red-500/20 text-red-300 border border-red-500/40',
      EXPIRED: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
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

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
            <ArrowDownCircle className="h-7 w-7 text-emerald-400" />
            Deposits
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Add funds to your wallet using USDT on supported networks.
          </p>
        </div>
      </div>

      {/* How to deposit - warm orange strip (same style as VIP/Referrals invitation) */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">How to deposit</p>
        <p className="text-sm text-slate-800/90">
          Send USDT to one of our deposit addresses (correct network required), then paste your transaction hash below to auto-fill the amount and create the deposit.
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <nav className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 sm:py-4 px-4 text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-primary-500/20 text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            New Deposit
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 sm:py-4 px-4 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary-500/20 text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Deposit History
          </button>
        </nav>
      </div>

      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Addresses */}
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-50 mb-2 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary-400" />
              Deposit Addresses
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Send USDT to one of these addresses. Use the correct network.
            </p>
            <div className="space-y-4">
              {companyAddresses &&
                Object.entries(companyAddresses)
                  .filter(([network]) => allowedNetworks.includes(network))
                  .map(([network, info]) => (
                    <div
                      key={network}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <span className="font-medium text-slate-50">{info.name || network}</span>
                        <span className="text-xs text-slate-400">Fee: {info.fee}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 text-xs bg-slate-950 p-3 rounded-lg border border-slate-700 break-all font-mono text-slate-200">
                          {info.address}
                        </code>
                        <button
                          onClick={() => handleCopyAddress(info.address, network)}
                          className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors shrink-0"
                          aria-label="Copy address"
                        >
                          {copiedAddress === network ? (
                            <Check className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Min: {info.minAmount} {info.supportedTokens?.join(', ')}
                      </p>
                    </div>
                  ))}
            </div>
          </div>

          {/* Create USDT Deposit Form */}
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary-400" />
              Create USDT Deposit
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Network</label>
                <select
                  value={depositForm.network}
                  onChange={(e) => {
                    setDepositForm({ ...depositForm, network: normalizeNetworkValue(e.target.value) })
                    setAutoFillData(null)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:opacity-70"
                  disabled={isAutoFillReady}
                >
                  <option value="BEP20">BSC (BEP20)</option>
                  <option value="POLYGON">Polygon</option>
                </select>
                {isAutoFillReady && (
                  <p className="mt-1 text-xs text-emerald-400">Network locked after successful auto-fill.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (USDT)</label>
                <input
                  type="text"
                  value={depositForm.amount}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-200 cursor-not-allowed"
                  placeholder="Auto-filled after entering transaction hash"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Amount is auto-detected from the blockchain and cannot be edited.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Hash</label>
                <input
                  type="text"
                  value={depositForm.transactionHash}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/\s/g, '')
                    setDepositForm({ ...depositForm, transactionHash: sanitizedValue, amount: '' })
                    setAutoFillData(null)
                    setLastAutoFilledHash(null)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm font-mono"
                  placeholder="Paste transaction hash (64+ characters)"
                />
                <div className="min-h-[1.5rem] mt-2">
                  {autoFillLoading && (
                    <p className="text-sm text-primary-400 flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin shrink-0" />
                      Checking blockchain for this transaction...
                    </p>
                  )}
                  {!autoFillLoading && !autoFillData && depositForm.transactionHash.trim().length >= 64 && (
                    <p className="text-xs text-slate-500">Verifying transaction...</p>
                  )}
                </div>
              </div>

              {autoFillData && (
                <div
                  className={`rounded-xl p-4 text-sm ${
                    isAutoFillReady
                      ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                      : 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                  }`}
                >
                  {isAutoFillReady
                    ? 'Transaction verified. You can now create the deposit.'
                    : autoFillData.message ||
                      'Transaction found but cannot be auto-filled. Please check the details.'}
                </div>
              )}

              {isAutoFillReady && (
                <button
                  onClick={handleCreateDeposit}
                  disabled={creatingDeposit}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {creatingDeposit ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ArrowDownCircle className="h-5 w-5" />
                      Create Deposit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-400" />
              Deposit History
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            {deposits.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No deposits yet</p>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">Date</span>
                        <span className="text-sm text-slate-200">{formatDate(deposit.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">Amount</span>
                        <span className="text-sm font-semibold text-slate-50">
                          {deposit.amount} {deposit.currency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">Network</span>
                        <span className="text-xs text-slate-300">{deposit.network || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">Status</span>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            deposit.status
                          )}`}
                        >
                          {deposit.status}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-700">
                        <span className="text-xs font-medium text-slate-400 block mb-1">Transaction Hash</span>
                        {deposit.transactionHash ? (
                          <code className="text-[10px] break-all text-slate-300 font-mono">
                            {deposit.transactionHash}
                          </code>
                        ) : (
                          <span className="text-xs text-slate-500">N/A</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/60">
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Network</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {deposits.map((deposit) => (
                        <tr key={deposit.id} className="bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                            {formatDate(deposit.createdAt)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                            {deposit.amount} {deposit.currency}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {deposit.network || 'N/A'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(deposit.status)}`}>
                              {deposit.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-slate-300">
                            {deposit.transactionHash ? (
                              <code className="text-xs break-all font-mono">
                                {deposit.transactionHash.substring(0, 20)}...
                              </code>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
