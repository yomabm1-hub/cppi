import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  Copy,
  Filter,
  Loader,
  PlugZap,
  RefreshCw,
  Search,
  Send,
  Shield,
  Wallet,
  XCircle,
} from 'lucide-react'
import { adminAPI } from '../services/api'
import useMetaMaskWallet, { METAMASK_NETWORKS } from '../hooks/useMetaMaskWallet'
import { buildTokenTransferTx, getTokenConfig } from '../utils/tokenTransfer'

const pageSize = 20
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortOrder: 'desc',
  })
  const [searchInput, setSearchInput] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [processModal, setProcessModal] = useState({
    open: false,
    withdrawal: null,
    action: 'APPROVE',
    adminNotes: '',
    transactionHash: '',
    submitting: false,
    autoPayout: false,
  })
  const {
    account: companyWalletAccount,
    chainId: companyWalletChainId,
    connect: connectMetaMask,
    switchNetwork: switchMetaMaskNetwork,
    isInstalled: isMetaMaskInstalled,
    connecting: connectingWallet,
    error: metaMaskError,
    clearError: clearMetaMaskError,
  } = useMetaMaskWallet()
  const [sendingOnChain, setSendingOnChain] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }))
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadWithdrawals()
  }, [page, filters.status, filters.search, filters.startDate, filters.endDate, filters.sortOrder])

  useEffect(() => {
    loadPendingCount()
  }, [])

  useEffect(() => {
    if (metaMaskError) {
      toast.error(metaMaskError?.message || 'MetaMask error occurred')
      clearMetaMaskError()
    }
  }, [metaMaskError, clearMetaMaskError])

  const loadWithdrawals = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getWithdrawals({
        page,
        limit: pageSize,
        status: filters.status || undefined,
        search: filters.search || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortOrder: filters.sortOrder || undefined,
      })
      setWithdrawals(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingCount = async () => {
    try {
      const response = await adminAPI.getPendingWithdrawals()
      setPendingCount(response.data.data?.length || 0)
    } catch (error) {
      console.error(error)
    }
  }

  const summary = useMemo(() => {
    const totalAmount = withdrawals.reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount || 0), 0)
    const pendingOnPage = withdrawals.filter((w) => w.status === 'PENDING').length
    return {
      pageTotalAmount: totalAmount,
      pagePending: pendingOnPage,
    }
  }, [withdrawals])

  const openProcessModal = (withdrawal, action) => {
    setProcessModal({
      open: true,
      withdrawal,
      action,
      adminNotes: withdrawal.adminNotes || '',
      transactionHash: withdrawal.transactionHash || '',
      submitting: false,
      autoPayout: false,
    })
  }

  const closeProcessModal = () => {
    setProcessModal({
      open: false,
      withdrawal: null,
      action: 'APPROVE',
      adminNotes: '',
      transactionHash: '',
      submitting: false,
      autoPayout: false,
    })
  }

  const handleProcessSubmit = async (event) => {
    event.preventDefault()
    if (!processModal.withdrawal) return
    setProcessModal((prev) => ({ ...prev, submitting: true }))
    try {
      await adminAPI.processWithdrawal(processModal.withdrawal.id, {
        action: processModal.action,
        adminNotes: processModal.adminNotes || undefined,
        transactionHash:
          processModal.action === 'APPROVE' && processModal.autoPayout
            ? undefined
            : processModal.transactionHash || undefined,
        autoPayout: processModal.action === 'APPROVE' ? processModal.autoPayout : undefined,
      })
      toast.success(`Withdrawal ${processModal.action === 'APPROVE' ? 'approved' : 'rejected'}`)
      closeProcessModal()
      await loadWithdrawals()
      await loadPendingCount()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to process withdrawal')
      setProcessModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  const renderStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      REJECTED: 'bg-red-500/20 text-red-300 border border-red-500/40',
    }
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/40'}`}
      >
        {status}
      </span>
    )
  }

  const [copiedAddressId, setCopiedAddressId] = useState(null)

  useEffect(() => {
    if (!copiedAddressId) return
    const timer = setTimeout(() => setCopiedAddressId(null), 1500)
    return () => clearTimeout(timer)
  }, [copiedAddressId])

  const handleCopyAddress = async (address, id) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddressId(id)
      toast.success('Address copied')
    } catch (error) {
      console.error('Failed to copy address:', error)
      toast.error('Failed to copy address')
    }
  }

  const modalWithdrawal = processModal.withdrawal
  const modalAmount = Number(modalWithdrawal?.amount || 0)
  const modalFee = Number(modalWithdrawal?.feeAmount || 0)
  const modalNetAmount = Math.max(0, modalAmount - modalFee).toString()
  const modalNetworkKey = modalWithdrawal?.network
  const modalCurrency = modalWithdrawal?.currency
  const modalTokenConfig = getTokenConfig(modalCurrency, modalNetworkKey)
  const modalNetworkMeta = modalNetworkKey ? METAMASK_NETWORKS[modalNetworkKey] : null
  const isNetworkMismatch =
    !!(companyWalletChainId && modalNetworkMeta) &&
    modalNetworkMeta.chainIdHex.toLowerCase() !== companyWalletChainId?.toLowerCase()
  const tokenPayoutSupported =
    processModal.action === 'APPROVE' && Boolean(modalTokenConfig && modalNetworkMeta)
  const truncatedCompanyAccount = companyWalletAccount
    ? `${companyWalletAccount.slice(0, 6)}...${companyWalletAccount.slice(-4)}`
    : null
  const currentChainMeta = companyWalletChainId
    ? Object.values(METAMASK_NETWORKS).find(
        (network) => network.chainIdHex === companyWalletChainId?.toLowerCase()
      )
    : null

  const handleGlobalConnectMetaMask = async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask extension not detected in this browser')
      return
    }
    try {
      await connectMetaMask()
      toast.success('MetaMask connected')
    } catch (error) {
      console.error('Failed to connect MetaMask:', error)
    }
  }

  const handleAdminConnectWallet = async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask is not detected in this browser')
      return
    }
    if (!modalNetworkKey) {
      toast.error('Withdrawal network is missing')
      return
    }
    try {
      await connectMetaMask(modalNetworkKey)
      toast.success('MetaMask connected')
    } catch (error) {
      toast.error(error?.message || 'Failed to connect MetaMask')
    }
  }

  const handleAdminSwitchNetwork = async () => {
    if (!modalNetworkKey) return
    try {
      await switchMetaMaskNetwork(modalNetworkKey)
      toast.success(`Switched MetaMask to ${modalNetworkMeta?.label || modalNetworkKey}`)
    } catch (error) {
      toast.error(error?.message || 'Unable to switch MetaMask network')
    }
  }

  const handleSendViaMetaMask = async () => {
    if (!tokenPayoutSupported || !modalWithdrawal) {
      toast.error('MetaMask payout is not supported for this withdrawal')
      return
    }
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask provider is not available in this environment')
      return
    }

    try {
      setSendingOnChain(true)
      let fromAddress = companyWalletAccount
      if (!fromAddress) {
        fromAddress = await connectMetaMask(modalNetworkKey)
      }
      if (!fromAddress) {
        throw new Error('MetaMask account is not connected')
      }
      if (isNetworkMismatch) {
        await switchMetaMaskNetwork(modalNetworkKey)
      }

      const txRequest = buildTokenTransferTx({
        from: fromAddress,
        to: modalWithdrawal.walletAddress,
        amount: modalNetAmount,
        currency: modalCurrency,
        network: modalNetworkKey,
      })

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txRequest],
      })

      setProcessModal((prev) => ({ ...prev, transactionHash: txHash }))
      toast.success('MetaMask payout submitted. Transaction hash recorded below.')
    } catch (error) {
      console.error('MetaMask payout failed:', error)
      toast.error(error?.message || 'Failed to send payout via MetaMask')
    } finally {
      setSendingOnChain(false)
    }
  }

  /** One-click Pay: send via MetaMask then automatically approve withdrawal with the tx hash */
  const handlePayWithMetaMaskAndApprove = async () => {
    if (!tokenPayoutSupported || !modalWithdrawal) {
      toast.error('MetaMask payout is not supported for this withdrawal')
      return
    }
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask provider is not available in this environment')
      return
    }
    if (!modalWithdrawal.walletAddress) {
      toast.error('Wallet address is missing for this withdrawal')
      return
    }

    try {
      setProcessModal((prev) => ({ ...prev, submitting: true }))
      setSendingOnChain(true)

      let fromAddress = companyWalletAccount
      if (!fromAddress) {
        fromAddress = await connectMetaMask(modalNetworkKey)
      }
      if (!fromAddress) {
        throw new Error('MetaMask account is not connected')
      }
      if (isNetworkMismatch) {
        await switchMetaMaskNetwork(modalNetworkKey)
      }

      const txRequest = buildTokenTransferTx({
        from: fromAddress,
        to: modalWithdrawal.walletAddress,
        amount: modalNetAmount,
        currency: modalCurrency,
        network: modalNetworkKey,
      })

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txRequest],
      })

      if (!txHash) {
        throw new Error('No transaction hash returned from MetaMask')
      }

      toast.success('Payment sent. Approving withdrawal...')

      await adminAPI.processWithdrawal(modalWithdrawal.id, {
        action: 'APPROVE',
        adminNotes: processModal.adminNotes || undefined,
        transactionHash: txHash,
      })

      toast.success('Withdrawal approved and payout completed')
      closeProcessModal()
      await loadWithdrawals()
      await loadPendingCount()
    } catch (error) {
      console.error('Pay with MetaMask failed:', error)
      toast.error(error?.message || 'Failed to pay and approve withdrawal')
      setProcessModal((prev) => ({ ...prev, submitting: false }))
    } finally {
      setSendingOnChain(false)
    }
  }

  const renderMobileCard = (withdrawal) => {
    const fallbackContact = withdrawal.user?.email || withdrawal.user?.phone || 'No contact info'
    const fee = Number(withdrawal.feeAmount || 0)
    const amount = Number(withdrawal.amount || 0)
    const netAmount = Math.max(0, amount - fee)
    return (
      <div
        key={withdrawal.id}
        className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-50">
              {withdrawal.user?.fullName || fallbackContact}
            </p>
            {withdrawal.user?.email && (
              <p className="text-xs text-slate-400">{withdrawal.user.email}</p>
            )}
            {withdrawal.user?.phone && (
              <p className="text-xs text-slate-400">{withdrawal.user.phone}</p>
            )}
            {!withdrawal.user?.email && !withdrawal.user?.phone && (
              <p className="text-xs text-slate-500">No contact info provided</p>
            )}
          </div>
          {renderStatusBadge(withdrawal.status)}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-400">Amount</p>
          <p>
            {amount.toFixed(2)} {withdrawal.currency}
          </p>
          <p className="font-semibold text-slate-400">Network</p>
          <p>{withdrawal.network || '—'}</p>
          <p className="font-semibold text-slate-400">Fee</p>
          <p>
            {fee.toFixed(2)} {withdrawal.currency}
          </p>
          <p className="font-semibold text-slate-400">Net</p>
          <p>
            {netAmount.toFixed(2)} {withdrawal.currency}
          </p>
          <p className="font-semibold text-slate-400">Wallet Address</p>
          <div
            className={`col-span-2 flex items-start gap-2 rounded-lg px-2 py-1 ${
              copiedAddressId === withdrawal.id ? 'bg-emerald-500/15 text-emerald-300' : ''
            }`}
          >
            <span className="flex-1 break-all">
              {withdrawal.walletAddress || 'Not provided'}
            </span>
            {withdrawal.walletAddress && (
              <button
                type="button"
                onClick={() => handleCopyAddress(withdrawal.walletAddress, withdrawal.id)}
                className="text-slate-400 hover:text-slate-100"
                aria-label="Copy address"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="font-semibold text-slate-400">Created</p>
          <p>{new Date(withdrawal.createdAt).toLocaleString()}</p>
        </div>
        {withdrawal.status === 'PENDING' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => openProcessModal(withdrawal, 'APPROVE')}
              className="btn-primary w-full sm:flex-1 inline-flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => openProcessModal(withdrawal, 'REJECT')}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium py-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950/95 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
              <ArrowUpCircle className="h-7 w-7 text-emerald-400" />
              Manage Withdrawals
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Review withdrawal requests, confirm payouts, and keep your treasury safe.
            </p>
          </div>
          <button
            onClick={loadWithdrawals}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-emerald-500/20 px-4 py-3 sm:px-6 sm:py-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-slate-950/80 p-2 shadow-md border border-amber-500/60">
              <Shield className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-50">
                Secure, on-chain withdrawals for your users
              </p>
              <p className="text-xs text-amber-100/80 mt-1">
                Use MetaMask payouts for supported networks or record manual transactions. Filters and
                search help you quickly audit any request.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-amber-100/80">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live status
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1">
              On-chain + manual flows
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 shadow-xl">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total Records</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {pagination?.totalItems || 0}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 shadow-xl">
            <p className="text-xs uppercase tracking-wide text-slate-400">Pending Withdrawals</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{pendingCount}</p>
            <p className="mt-1 text-xs text-slate-500">Across all pages</p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 shadow-xl">
            <p className="text-xs uppercase tracking-wide text-slate-400">Page Total Amount</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              ${summary.pageTotalAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Pending on page: <span className="font-semibold text-slate-300">{summary.pagePending}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-50">MetaMask Wallet</p>
            </div>
            <p className="text-xl font-semibold text-slate-50">
              {companyWalletAccount ? truncatedCompanyAccount : 'Not connected'}
            </p>
            <p className="text-xs text-slate-400">
              {companyWalletAccount
                ? `Network: ${currentChainMeta?.label || companyWalletChainId || 'Unknown'}`
                : 'Connect your company wallet to enable on-chain payouts.'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleGlobalConnectMetaMask}
                disabled={connectingWallet}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60"
              >
                {connectingWallet ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <PlugZap className="h-4 w-4" />
                )}
                {companyWalletAccount ? 'Refresh MetaMask' : 'Connect MetaMask'}
              </button>
              {!isMetaMaskInstalled && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-300 underline text-center"
                >
                  Install MetaMask
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone, address, or hash..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-9 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between lg:hidden">
              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-50"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${
                showAdvancedFilters ? 'grid' : 'hidden'
              } lg:grid`}
            >
              <label className="text-xs text-slate-400 flex flex-col">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </span>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                    setPage(1)
                  }}
                  className="mt-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                />
              </label>
              <label className="text-xs text-slate-400 flex flex-col">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  End Date
                </span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                    setPage(1)
                  }}
                  className="mt-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                />
              </label>

              <div className="text-xs text-slate-400 flex flex-col">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  Quick Actions
                </span>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: '', search: '', startDate: '', endDate: '' })
                      setSearchInput('')
                      setPage(1)
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : withdrawals.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              No withdrawals match the current filters.
            </p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        User
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Network
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-400 uppercase text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="px-4 py-3 align-top">
                          <p className="font-semibold text-slate-50">
                            {withdrawal.user?.fullName ||
                              withdrawal.user?.email ||
                              withdrawal.user?.phone ||
                              'No contact info'}
                          </p>
                          {withdrawal.user?.email && (
                            <p className="text-xs text-slate-400">{withdrawal.user.email}</p>
                          )}
                          {withdrawal.user?.phone && (
                            <p className="text-xs text-slate-400">{withdrawal.user.phone}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Balance:{' '}
                            <span className="font-medium text-emerald-300">
                              {Number(withdrawal.user?.wallet?.balance || 0).toFixed(2)}
                            </span>
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-semibold text-emerald-300">
                            {Number(withdrawal.amount).toFixed(2)} {withdrawal.currency}
                          </p>
                          {withdrawal.feeAmount && (
                            <p className="text-xs text-slate-400 mt-1">
                              Fee: {Number(withdrawal.feeAmount).toFixed(2)} · Net:{' '}
                              {(Number(withdrawal.amount) - Number(withdrawal.feeAmount)).toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300 align-top">
                          {withdrawal.network || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300 align-top">
                          <div
                            className={`flex items-start gap-2 break-all rounded-lg px-2 py-1 ${
                              copiedAddressId === withdrawal.id
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-slate-900/80'
                            }`}
                          >
                            <span className="flex-1 break-all">
                              {withdrawal.walletAddress || 'Not provided'}
                            </span>
                            {withdrawal.walletAddress && (
                              <button
                                type="button"
                                onClick={() => handleCopyAddress(withdrawal.walletAddress, withdrawal.id)}
                                className="text-slate-400 hover:text-slate-100"
                                aria-label="Copy address"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300 align-top">
                          {new Date(withdrawal.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{renderStatusBadge(withdrawal.status)}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {withdrawal.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => openProcessModal(withdrawal, 'APPROVE')}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => openProcessModal(withdrawal, 'REJECT')}
                                className="inline-flex items-center gap-2 text-xs rounded-xl border border-red-500/60 text-red-300 px-3 py-2 font-medium bg-red-500/10 hover:bg-red-500/20"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">{withdrawals.map(renderMobileCard)}</div>
            </>
          )}

          {withdrawals.length > 0 && pagination && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={page === pagination.totalPages}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {processModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-50">
                {processModal.action === 'APPROVE' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </h3>
              <button onClick={closeProcessModal} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleProcessSubmit}>
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">User</p>
                  <p className="font-semibold text-slate-50">
                    {processModal.withdrawal?.user?.fullName ||
                      processModal.withdrawal?.user?.email ||
                      processModal.withdrawal?.user?.phone ||
                      'Unknown User'}
                  </p>
                  {processModal.withdrawal?.user?.email && (
                    <p className="text-xs text-slate-400">{processModal.withdrawal.user.email}</p>
                  )}
                  {processModal.withdrawal?.user?.phone && (
                    <p className="text-xs text-slate-400">{processModal.withdrawal.user.phone}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>Amount</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {Number(processModal.withdrawal?.amount || 0).toFixed(2)} {processModal.withdrawal?.currency}
                  </p>
                  <p>Fee</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {Number(processModal.withdrawal?.feeAmount || 0).toFixed(2)} {processModal.withdrawal?.currency}
                  </p>
                  <p>Net to Send</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {(Number(processModal.withdrawal?.amount || 0) - Number(processModal.withdrawal?.feeAmount || 0)).toFixed(2)}{' '}
                    {processModal.withdrawal?.currency}
                  </p>
                  <p>Currency</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {processModal.withdrawal?.currency} • {processModal.withdrawal?.network || 'N/A'}
                  </p>
                  <p>Status</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {processModal.withdrawal?.status || 'PENDING'}
                  </p>
                </div>
              </div>

              {processModal.action === 'APPROVE' && (
                <div className="space-y-3">
                  <div className="border border-primary-100 rounded-xl bg-primary-50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-white p-2">
                        <Wallet className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary-900">
                          Pay out with company MetaMask wallet
                        </p>
                        <p className="text-xs text-primary-800">
                          {tokenPayoutSupported
                            ? 'Connect your MetaMask wallet to send the net amount directly to the provided address.'
                            : 'MetaMask payouts are available for USDT/USDC withdrawals on BEP20, Polygon, Arbitrum, or Optimism networks.'}
                        </p>
                      </div>
                    </div>

                    {isMetaMaskInstalled ? (
                      tokenPayoutSupported ? (
                        <>
                          <div className="text-xs text-primary-900 space-y-1">
                            <p>
                              Network:{' '}
                              <span className="font-semibold">
                                {modalNetworkMeta?.label || modalNetworkKey}
                              </span>
                            </p>
                            <p>
                              Token:{' '}
                              <span className="font-semibold">{modalCurrency}</span> • Net to send:{' '}
                              <span className="font-semibold">
                                {Number(modalNetAmount || 0).toFixed(2)}
                              </span>
                            </p>
                            {companyWalletAccount && (
                              <p>
                                Connected as{' '}
                                <span className="font-semibold">{truncatedCompanyAccount}</span>
                              </p>
                            )}
                            {!modalWithdrawal?.walletAddress && (
                              <p className="text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" /> Wallet address missing.
                              </p>
                            )}
                          </div>

                          {isNetworkMismatch && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Switch MetaMask to {modalNetworkMeta?.label || modalNetworkKey} before
                              sending.
                            </p>
                          )}

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={handlePayWithMetaMaskAndApprove}
                              disabled={
                                processModal.submitting ||
                                sendingOnChain ||
                                !companyWalletAccount ||
                                isNetworkMismatch ||
                                !modalWithdrawal?.walletAddress
                              }
                              className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3 font-semibold"
                            >
                              {processModal.submitting || sendingOnChain ? (
                                <Loader className="h-5 w-5 animate-spin" />
                              ) : (
                                <Send className="h-5 w-5" />
                              )}
                              {processModal.submitting || sendingOnChain
                                ? processModal.submitting
                                  ? 'Approving...'
                                  : 'Sending...'
                                : 'Pay with MetaMask & Approve'}
                            </button>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={handleAdminConnectWallet}
                                disabled={connectingWallet}
                                className="btn-secondary flex items-center justify-center gap-2"
                              >
                                {connectingWallet ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <PlugZap className="h-4 w-4" />
                                )}
                                {companyWalletAccount ? 'Refresh MetaMask' : 'Connect MetaMask'}
                              </button>
                              {isNetworkMismatch && (
                                <button
                                  type="button"
                                  onClick={handleAdminSwitchNetwork}
                                  className="btn-secondary flex items-center justify-center gap-2"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                  Switch Network
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={handleSendViaMetaMask}
                                disabled={
                                  sendingOnChain ||
                                  processModal.submitting ||
                                  !companyWalletAccount ||
                                  isNetworkMismatch ||
                                  !modalWithdrawal?.walletAddress
                                }
                                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                              >
                                {sendingOnChain ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                Send only (record hash manually)
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null
                    ) : (
                      <p className="text-xs text-primary-800">
                        MetaMask extension not detected.{' '}
                        <a
                          href="https://metamask.io/download/"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Install MetaMask
                        </a>{' '}
                        to enable one-click payouts.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Hash {processModal.autoPayout && '(auto-filled)'}
                    </label>
                    <input
                      type="text"
                      value={processModal.transactionHash}
                      onChange={(e) =>
                        setProcessModal((prev) => ({ ...prev, transactionHash: e.target.value }))
                      }
                      className="input-field"
                      placeholder={
                        processModal.autoPayout
                          ? 'Will be populated automatically after payout'
                          : 'Provide the payout hash'
                      }
                      disabled={processModal.autoPayout}
                    />
                  </div>

                  <div className="flex items-start gap-3 border border-gray-200 rounded-xl p-3">
                    <input
                      id="autoPayoutToggle"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={processModal.autoPayout}
                      onChange={(e) =>
                        setProcessModal((prev) => ({ ...prev, autoPayout: e.target.checked }))
                      }
                      disabled={!tokenPayoutSupported}
                    />
                    <div>
                      <label
                        htmlFor="autoPayoutToggle"
                        className="text-sm font-medium text-gray-900"
                      >
                        Auto pay with company wallet (server-side)
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Payouts will be signed with the configured company private key and the
                        transaction hash will be recorded automatically.{' '}
                        {tokenPayoutSupported
                          ? ''
                          : 'This withdrawal is not eligible for automatic payouts.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={processModal.adminNotes}
                  onChange={(e) =>
                    setProcessModal((prev) => ({ ...prev, adminNotes: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Why are you approving or rejecting this withdrawal?"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeProcessModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={processModal.submitting}>
                  {processModal.submitting
                    ? 'Processing...'
                    : processModal.action === 'APPROVE'
                    ? 'Approve'
                    : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

