import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { Search, Users, ToggleLeft, ToggleRight, RefreshCw, Loader, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const pageSize = 10

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadUsers()
  }, [page, debouncedSearch])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUsers({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
      })
      setUsers(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId)
    try {
      await adminAPI.toggleUserStatus(userId)
      toast.success('User status updated')
      await loadUsers()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = pagination?.totalPages || 1

  const formatCurrency = (value = 0) => `$${Number(value || 0).toFixed(2)}`

  const summary = useMemo(() => {
    return {
      active: users.filter((u) => u.isActive).length,
      vip: users.filter((u) => u.userVip).length,
      referrals: users.reduce((sum, u) => sum + (u._count?.referrals || 0), 0),
    }
  }, [users])

  const renderMobileCard = (user) => (
    <div
      key={user.id}
      className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-3 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-50">
            {user.fullName || 'Unnamed User'}
          </p>
          <p className="text-xs text-slate-400">
            {user.email || user.phone || 'No contact'}
          </p>
          <p className="text-xs text-slate-500">Code: {user.referralCode}</p>
        </div>
        {user.userVip?.vipLevel ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
            {user.userVip.vipLevel.name}
          </span>
        ) : (
          <span className="text-xs text-slate-500">No VIP</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400">Balance</p>
          <p className="text-sm font-semibold text-slate-50">
            {formatCurrency(user.wallet?.balance)}
          </p>
        </div>
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400">Deposits</p>
          <p className="text-sm font-semibold text-slate-50">
            {formatCurrency(user.wallet?.totalDeposits)}
          </p>
        </div>
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400">Earnings</p>
          <p className="text-sm font-semibold text-slate-50">
            {formatCurrency(user.wallet?.totalEarnings)}
          </p>
        </div>
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400">Withdrawals</p>
          <p className="text-sm font-semibold text-slate-50">
            {user._count?.withdrawals || 0}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => navigate(`/admin/users/${user.id}`)}
          className="btn-primary w-full sm:flex-1"
        >
          View Details
        </button>
        <button
          onClick={() => handleToggleStatus(user.id)}
          disabled={togglingId === user.id}
          className={`w-full sm:flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border ${
            user.isActive
              ? 'bg-red-500/15 text-red-300 border-red-500/40'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {togglingId === user.id ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : user.isActive ? (
            <>
              <ToggleLeft className="mr-2 h-4 w-4" />
              Disable
            </>
          ) : (
            <>
              <ToggleRight className="mr-2 h-4 w-4" />
              Enable
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary-400" />
            User Management
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Search, review, and manage user accounts.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="btn-secondary w-full sm:w-auto bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-2xl font-semibold text-slate-50">
            {pagination?.totalItems ?? users.length}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
          <p className="text-sm text-slate-400">Active Users</p>
          <p className="text-2xl font-semibold text-slate-50">{summary.active}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl">
          <p className="text-sm text-slate-400">VIP Members</p>
          <p className="text-2xl font-semibold text-slate-50">{summary.vip}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name, email, phone, referral code..."
              className="w-full pl-10 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages} · {pagination?.totalItems || 0} users
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-6 w-6 animate-spin text-primary-400" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No users found</p>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        VIP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        Wallet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        Activity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-950 divide-y divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-50">
                            {user.fullName || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {user.email || user.phone || 'No contact'}
                          </p>
                          <p className="text-xs text-slate-500">Code: {user.referralCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          {user.userVip?.vipLevel ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
                              {user.userVip.vipLevel.name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-200">
                          <p>Balance: {formatCurrency(user.wallet?.balance)}</p>
                          <p className="text-xs text-slate-400">
                            Deposits: {formatCurrency(user.wallet?.totalDeposits)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Earnings: {formatCurrency(user.wallet?.totalEarnings)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-200">
                          <p>Refs: {user._count?.referrals || 0}</p>
                          <p className="text-xs text-slate-400">
                            Deposits: {user._count?.deposits || 0} · Withdrawals: {user._count?.withdrawals || 0}
                          </p>
                          <p className="text-xs text-slate-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right space-y-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={togglingId === user.id}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${
                              user.isActive
                                ? 'bg-red-500/15 text-red-300 border-red-500/40'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {togglingId === user.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : user.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Enable
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-4">
              {users.map(renderMobileCard)}
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

