import { useEffect, useState } from 'react'
import { walletAPI } from '../services/api'
import { Wallet as WalletIcon, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Wallet() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletAPI.getStats().catch(() => null),
        walletAPI.getTransactions({ page, limit: 10 }).catch(() => null),
      ])

      if (walletData?.data?.data) {
        setStats(walletData.data.data)
      }

      if (transactionsData?.data?.data) {
        setTransactions(transactionsData.data.data || [])
        setTotalPages(transactionsData.data.pagination?.totalPages || 1)
      } else {
        setTransactions([])
        setTotalPages(1)
      }
    } catch (error) {
      toast.error('Failed to load wallet data')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionColor = (type) => {
    const colors = {
      DEPOSIT: 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/40',
      WITHDRAWAL: 'text-rose-300 bg-rose-500/15 border border-rose-500/40',
      REFERRAL_BONUS: 'text-sky-300 bg-sky-500/15 border border-sky-500/40',
      VIP_EARNINGS: 'text-purple-300 bg-purple-500/15 border border-purple-500/40',
      WALLET_GROWTH: 'text-amber-300 bg-amber-500/15 border border-amber-500/40',
    }
    return colors[type] || 'text-slate-300 bg-slate-800/80 border border-slate-700'
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <WalletIcon className="h-7 w-7 text-primary-400 mr-2" />
            Wallet
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Manage your wallet balance and track inflows and outflows.
          </p>
        </div>
      </div>

      {/* Wallet overview row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* Main balance card */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Available Balance
              </p>
              <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-50 break-all">
                ${parseFloat(stats?.balance || 0).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Total liquid funds ready for withdrawals or new investments.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[220px]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Total Deposits
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-50 break-all">
                    ${parseFloat(stats?.totalDeposits || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Total Earnings
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-50 break-all">
                    ${parseFloat(stats?.totalEarnings || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-300">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side stats */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Daily Earnings
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300 break-all">
                  ${parseFloat(stats?.dailyEarnings || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 rounded-full bg-emerald-500/15 text-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Referral Bonuses
                </p>
                <p className="mt-2 text-2xl font-semibold text-sky-300 break-all">
                  ${parseFloat(stats?.totalReferralBonus || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 rounded-full bg-sky-500/15 text-sky-300">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Last Growth Update
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50 break-all">
                  {stats?.lastGrowthUpdate ? formatDate(stats.lastGrowthUpdate) : 'N/A'}
                </p>
              </div>
              <div className="p-2.5 rounded-full bg-indigo-500/15 text-indigo-300">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
              Recent Transactions
            </h2>
            <p className="text-sm text-slate-400">
              Latest inflows and outflows affecting your balance.
            </p>
          </div>
          <a
            href="/transactions"
            className="text-sm font-medium text-primary-300 hover:text-primary-200 flex items-center"
          >
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {transactions.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.type.replace('_', ' ')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-50">{transaction.description}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold text-sm ${
                      transaction.type === 'DEPOSIT' || transaction.type === 'REFERRAL_BONUS'
                        ? 'text-emerald-300'
                        : 'text-slate-100'
                    }`}
                  >
                    {transaction.type === 'DEPOSIT' || transaction.type === 'REFERRAL_BONUS'
                      ? '+'
                      : '-'}
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

