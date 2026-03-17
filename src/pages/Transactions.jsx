import { useEffect, useState } from 'react'
import { walletAPI } from '../services/api'
import { History, Filter, ArrowLeftRight, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [page, filter])

  const loadData = async () => {
    try {
      const params = { page, limit: 20 }
      if (filter) params.type = filter

      const response = await walletAPI.getTransactions(params).catch(() => null)
      if (response?.data) {
        setTransactions(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setTransactions([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionColor = (type) => {
    const colors = {
      DEPOSIT: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      WITHDRAWAL: 'bg-red-500/20 text-red-300 border border-red-500/40',
      REFERRAL_BONUS: 'bg-primary-500/20 text-primary-300 border border-primary-500/40',
      VIP_EARNINGS: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
      WALLET_GROWTH: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      VIP_PAYMENT: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
      ADMIN_ADJUSTMENT: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
      TASK_REWARD: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
    }
    return colors[type] || 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
  }

  const isCredit = (type) =>
    ['DEPOSIT', 'REFERRAL_BONUS', 'VIP_EARNINGS', 'WALLET_GROWTH', 'TASK_REWARD'].includes(type)

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
          <ArrowLeftRight className="h-7 w-7 text-primary-400" />
          Transactions
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">View all your transaction history</p>
      </div>

      {/* Info strip - warm orange */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Transaction history</p>
        <p className="text-sm text-slate-800/90">
          All deposits, withdrawals, earnings, and bonuses appear here. Use the filter to show specific types.
        </p>
      </div>

      {/* Filter */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all min-w-[200px]"
          >
            <option value="">All Transactions</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="REFERRAL_BONUS">Referral Bonuses</option>
            <option value="VIP_EARNINGS">VIP Earnings</option>
            <option value="WALLET_GROWTH">Wallet Growth</option>
            <option value="VIP_PAYMENT">VIP Payments</option>
            <option value="TASK_REWARD">Task Rewards</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-400" />
            History
          </h2>
        </div>
        <div className="p-5 sm:p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <History className="h-14 w-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/60">
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTransactionColor(
                              transaction.type
                            )}`}
                          >
                            {transaction.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-200">
                          {transaction.description}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <span
                            className={
                              isCredit(transaction.type)
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }
                          >
                            {isCredit(transaction.type) ? '+' : '-'}$
                            {parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-400">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl bg-slate-700 border border-slate-600 text-slate-200 font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl bg-slate-700 border border-slate-600 text-slate-200 font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
