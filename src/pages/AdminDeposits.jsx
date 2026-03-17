import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowDownCircle,
  CheckCircle,
  Filter,
  Loader,
  RefreshCw,
  Search,
  XCircle,
  Calendar,
} from 'lucide-react'
import { adminAPI } from '../services/api'

const pageSize = 20
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [searchInput, setSearchInput] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [processModal, setProcessModal] = useState({
    open: false,
    deposit: null,
    action: 'APPROVE',
    adminNotes: '',
    transactionHash: '',
    submitting: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }))
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadDeposits()
  }, [page, filters.status, filters.search, filters.startDate, filters.endDate])

  useEffect(() => {
    loadPendingCount()
  }, [])

  const loadDeposits = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getDeposits({
        page,
        limit: pageSize,
        status: filters.status || undefined,
        search: filters.search || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setDeposits(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingCount = async () => {
    try {
      const response = await adminAPI.getPendingDeposits()
      setPendingCount(response.data.data?.length || 0)
    } catch (error) {
      console.error(error)
    }
  }

  const summary = useMemo(() => {
    const totalAmount = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0)
    const pendingOnPage = deposits.filter((d) => d.status === 'PENDING').length
    return {
      pageTotalAmount: totalAmount,
      pagePending: pendingOnPage,
    }
  }, [deposits])

  const openProcessModal = (deposit, action) => {
    setProcessModal({
      open: true,
      deposit,
      action,
      adminNotes: deposit.adminNotes || '',
      transactionHash: deposit.transactionHash || '',
      submitting: false,
    })
  }

  const closeProcessModal = () => {
    setProcessModal({
      open: false,
      deposit: null,
      action: 'APPROVE',
      adminNotes: '',
      transactionHash: '',
      submitting: false,
    })
  }

  const handleProcessSubmit = async (event) => {
    event.preventDefault()
    if (!processModal.deposit) return
    setProcessModal((prev) => ({ ...prev, submitting: true }))
    try {
      await adminAPI.processDeposit(processModal.deposit.id, {
        action: processModal.action,
        adminNotes: processModal.adminNotes || undefined,
        transactionHash: processModal.transactionHash || undefined,
      })
      toast.success(`Deposit ${processModal.action === 'APPROVE' ? 'confirmed' : 'rejected'}`)
      closeProcessModal()
      await loadDeposits()
      await loadPendingCount()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to process deposit')
      setProcessModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  const renderStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      CONFIRMED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
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

const renderMobileCard = (deposit) => {
  const fallbackContact = deposit.user?.email || deposit.user?.phone || 'No contact info'
  return (
    <div
      key={deposit.id}
      className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-50">
            {deposit.user?.fullName || fallbackContact}
          </p>
          {deposit.user?.email && <p className="text-xs text-slate-400">{deposit.user.email}</p>}
          {deposit.user?.phone && <p className="text-xs text-slate-400">{deposit.user.phone}</p>}
          {!deposit.user?.email && !deposit.user?.phone && (
            <p className="text-xs text-slate-500">No contact info provided</p>
          )}
        </div>
        {renderStatusBadge(deposit.status)}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
        <p className="font-semibold text-slate-400">Amount</p>
        <p>
          {Number(deposit.amount).toFixed(2)} {deposit.currency}
        </p>
        <p className="font-semibold text-slate-400">Network</p>
        <p>{deposit.network || '—'}</p>
        <p className="font-semibold text-slate-400">Type</p>
        <p>{deposit.depositType || 'N/A'}</p>
        <p className="font-semibold text-slate-400">Created</p>
        <p>{new Date(deposit.createdAt).toLocaleString()}</p>
        <p className="font-semibold text-slate-400">Tx Hash</p>
        <p className="col-span-1 truncate">{deposit.transactionHash || 'Not provided'}</p>
      </div>
      {deposit.status === 'PENDING' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => openProcessModal(deposit, 'APPROVE')}
            className="btn-primary w-full sm:flex-1 inline-flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={() => openProcessModal(deposit, 'REJECT')}
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
    <>
      <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <ArrowDownCircle className="h-7 w-7 text-emerald-400" />
              Manage Deposits
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">
              Review and process user deposits with full audit context.
            </p>
          </div>
          <button
            onClick={loadDeposits}
            className="btn-secondary w-full sm:w-auto bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
            <p className="text-sm text-slate-400">Total Records</p>
            <p className="text-2xl font-semibold text-slate-50">
              {pagination?.totalItems || 0}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
            <p className="text-sm text-slate-400">Pending Deposits</p>
            <p className="text-2xl font-semibold text-amber-300">{pendingCount}</p>
            <p className="text-xs text-slate-500">Across all pages</p>
          </div>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
            <p className="text-sm text-slate-400">Page Total Amount</p>
            <p className="text-2xl font-semibold text-slate-50">
              ${summary.pageTotalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">Pending on page: {summary.pagePending}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone, or transaction hash..."
                  className="w-full pl-10 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                    setPage(1)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between lg:hidden">
              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100"
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
                  className="mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
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
                  className="mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
              </label>

              <div className="text-xs text-slate-400 flex flex-col">
                <span className="inline-flex items-center gap-1 text-slate-300">Quick Actions</span>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: '', search: '', startDate: '', endDate: '' })
                      setSearchInput('')
                      setPage(1)
                    }}
                    className="btn-secondary w-full bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-6 w-6 animate-spin text-primary-400" />
            </div>
          ) : deposits.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              No deposits match the current filters.
            </p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                  <thead className="bg-slate-900/70">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        Network
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950">
                    {deposits.map((deposit) => (
                      <tr key={deposit.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-50">
                            {deposit.user?.fullName || deposit.user?.email || deposit.user?.phone || 'No contact info'}
                          </p>
                          {deposit.user?.email && (
                            <p className="text-xs text-slate-400">{deposit.user.email}</p>
                          )}
                          {deposit.user?.phone && (
                            <p className="text-xs text-slate-400">{deposit.user.phone}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            Tx: {deposit.transactionHash || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-50">
                            {Number(deposit.amount).toFixed(2)} {deposit.currency}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {deposit.network || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300 uppercase">
                          {deposit.depositType || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {new Date(deposit.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{renderStatusBadge(deposit.status)}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {deposit.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => openProcessModal(deposit, 'APPROVE')}
                                className="btn-primary inline-flex items-center gap-2 text-xs"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => openProcessModal(deposit, 'REJECT')}
                                className="inline-flex items-center gap-2 text-xs rounded-lg border border-red-500/40 bg-red-500/15 text-red-300 px-3 py-2 font-medium"
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

              <div className="md:hidden space-y-4">{deposits.map(renderMobileCard)}</div>
            </>
          )}

          {deposits.length > 0 && pagination && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
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
                {processModal.action === 'APPROVE' ? 'Approve Deposit' : 'Reject Deposit'}
              </h3>
              <button
                onClick={closeProcessModal}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleProcessSubmit}>
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-50">
                  {processModal.deposit?.user?.fullName || 'Unknown User'}
                </p>
                <p className="text-xs text-slate-400">
                  {processModal.deposit?.user?.email}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <p>
                    <span className="text-slate-400 text-xs">Amount</span>
                    <br />
                    <span className="font-semibold text-slate-50">
                      {Number(processModal.deposit?.amount || 0).toFixed(2)} {processModal.deposit?.currency}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400 text-xs">Network</span>
                    <br />
                    <span className="font-semibold text-slate-50">
                      {processModal.deposit?.network || '—'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={processModal.transactionHash}
                  onChange={(e) => setProcessModal((prev) => ({ ...prev, transactionHash: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Optional hash for auditing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={processModal.adminNotes}
                  onChange={(e) => setProcessModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Why are you approving or rejecting this deposit?"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProcessModal}
                  className="btn-secondary bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={processModal.submitting}>
                  {processModal.submitting ? 'Processing...' : processModal.action === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

