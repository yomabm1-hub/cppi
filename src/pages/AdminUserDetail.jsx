import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Crown,
  LineChart,
  Loader,
  Shield,
  ToggleLeft,
  ToggleRight,
  TreePine,
  Wallet,
  UserCheck,
} from 'lucide-react'
import { adminAPI, vipAPI } from '../services/api'

const formatCurrency = (value = 0) => `$${Number(value || 0).toFixed(2)}`
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A')

export default function AdminUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [earningsLoading, setEarningsLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [activeTab, setActiveTab] = useState('Deposits')
  const [depositHistory, setDepositHistory] = useState(null)
  const [depositLoading, setDepositLoading] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState(null)
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [referralTree, setReferralTree] = useState(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [vipLevels, setVipLevels] = useState([])
  const [vipLevelsLoading, setVipLevelsLoading] = useState(false)
  const [vipModalOpen, setVipModalOpen] = useState(false)
  const [vipModalMode, setVipModalMode] = useState('assign')
  const [selectedVipId, setSelectedVipId] = useState('')
  const [vipPaymentAmount, setVipPaymentAmount] = useState('')
  const [vipAdminNotes, setVipAdminNotes] = useState('')
  const [vipSubmitting, setVipSubmitting] = useState(false)

  const loadUser = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUserDetail(userId)
      setUser(response.data.data)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load user detail')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }, [userId, navigate])

  const loadEarnings = useCallback(async () => {
    setEarningsLoading(true)
    try {
      const response = await adminAPI.getUserEarnings(userId, { limit: 10 })
      setEarnings(response.data.data || null)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load earnings history')
      setEarnings(null)
    } finally {
      setEarningsLoading(false)
    }
  }, [userId])

  const loadDeposits = useCallback(async () => {
    setDepositLoading(true)
    try {
      const response = await adminAPI.getUserDeposits(userId, { limit: 10 })
      setDepositHistory(response.data.data || { deposits: [], pagination: null })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load deposits')
      setDepositHistory({ deposits: [], pagination: null })
    } finally {
      setDepositLoading(false)
    }
  }, [userId])

  const loadWithdrawals = useCallback(async () => {
    setWithdrawalLoading(true)
    try {
      const response = await adminAPI.getUserWithdrawals(userId, { limit: 10 })
      setWithdrawalHistory(response.data.data || { withdrawals: [], pagination: null })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load withdrawals')
      setWithdrawalHistory({ withdrawals: [], pagination: null })
    } finally {
      setWithdrawalLoading(false)
    }
  }, [userId])

  const loadReferralTree = useCallback(async () => {
    setReferralLoading(true)
    try {
      const response = await adminAPI.getUserReferralTree(userId, 4)
      setReferralTree(response.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load referral tree')
      setReferralTree([])
    } finally {
      setReferralLoading(false)
    }
  }, [userId])

  const loadVipLevels = useCallback(async () => {
    setVipLevelsLoading(true)
    try {
      const response = await vipAPI.getLevels()
      const levels = response.data?.data || response.data
      const parsedLevels = Array.isArray(levels) ? levels : levels?.levels || []
      setVipLevels(parsedLevels)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load VIP levels')
    } finally {
      setVipLevelsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
    // Preload frequently-used datasets
    loadDeposits()
    loadEarnings()
}, [loadUser, loadEarnings, loadDeposits])

  useEffect(() => {
    if (activeTab === 'Earnings' && !earnings && !earningsLoading) {
      loadEarnings()
    }
    if (activeTab === 'Deposits' && !depositHistory && !depositLoading) {
      loadDeposits()
    }
    if (activeTab === 'Withdrawals' && !withdrawalHistory && !withdrawalLoading) {
      loadWithdrawals()
    }
    if (activeTab === 'Referrals' && !referralTree && !referralLoading) {
      loadReferralTree()
    }
  }, [
    activeTab,
    earnings,
    earningsLoading,
    depositHistory,
    depositLoading,
    withdrawalHistory,
    withdrawalLoading,
    loadEarnings,
    loadDeposits,
    loadWithdrawals,
    referralTree,
    referralLoading,
    loadReferralTree
  ])

useEffect(() => {
  if (vipModalOpen && !vipLevelsLoading && !vipLevels.length) {
    loadVipLevels()
  }
}, [vipModalOpen, vipLevels.length, vipLevelsLoading, loadVipLevels])

const getDefaultVipLevel = useCallback(
  (mode) => {
    if (!vipLevels.length) return null
    if (mode === 'upgrade' && user?.userVip?.vipLevelId) {
      const filtered = vipLevels.filter((level) => level.id !== user.userVip.vipLevelId)
      return filtered[0] || null
    }
    return vipLevels[0]
  },
  [vipLevels, user]
)

useEffect(() => {
  if (!vipModalOpen || !vipLevels.length) return
  const hasSelection = vipLevels.some((level) => level.id === selectedVipId)
  if (hasSelection) {
    return
  }
  const defaultLevel = getDefaultVipLevel(vipModalMode)
  if (defaultLevel) {
    setSelectedVipId(defaultLevel.id)
    setVipPaymentAmount(parseFloat(defaultLevel.amount || 0).toFixed(2))
  }
}, [vipModalOpen, vipLevels, selectedVipId, vipModalMode, getDefaultVipLevel])

const availableVipLevels = useMemo(() => {
  if (vipModalMode === 'upgrade' && user?.userVip?.vipLevelId) {
    return vipLevels.filter((level) => level.id !== user.userVip.vipLevelId)
  }
  return vipLevels
}, [vipLevels, vipModalMode, user])

const selectedVipLevel = useMemo(
  () => vipLevels.find((level) => level.id === selectedVipId),
  [vipLevels, selectedVipId]
)

const openVipModal = (mode) => {
  setVipModalMode(mode)
  setVipModalOpen(true)
  setVipAdminNotes('')
  if (vipLevels.length) {
    const defaultLevel = getDefaultVipLevel(mode)
    if (defaultLevel) {
      setSelectedVipId(defaultLevel.id)
      setVipPaymentAmount(parseFloat(defaultLevel.amount || 0).toFixed(2))
    } else {
      setSelectedVipId('')
      setVipPaymentAmount('')
    }
  } else {
    setSelectedVipId('')
    setVipPaymentAmount('')
  }
}

const closeVipModal = () => {
  setVipModalOpen(false)
  setVipAdminNotes('')
  setSelectedVipId('')
  setVipPaymentAmount('')
}

const handleVipLevelChange = (event) => {
  const { value } = event.target
  setSelectedVipId(value)
  const level = vipLevels.find((item) => item.id === value)
  if (level) {
    setVipPaymentAmount(parseFloat(level.amount || 0).toFixed(2))
  }
}

const handleVipSubmit = async (event) => {
  event.preventDefault()
  if (!selectedVipId) {
    toast.error('Please select a VIP level')
    return
  }

  setVipSubmitting(true)
  try {
    if (vipModalMode === 'assign') {
      const amountValue = parseFloat(vipPaymentAmount || selectedVipLevel?.amount || 0)
      if (!amountValue || amountValue <= 0) {
        toast.error('Enter a valid payment amount')
        setVipSubmitting(false)
        return
      }

      await adminAPI.assignVip({
        userId: user.id,
        vipLevelId: selectedVipId,
        paymentAmount: amountValue,
        adminNotes: vipAdminNotes || undefined,
        assignedBy: 'admin_portal'
      })
      toast.success('VIP level assigned successfully')
    } else {
      const currentAmount = parseFloat(user?.userVip?.vipLevel?.amount || 0)
      const newAmount = parseFloat(selectedVipLevel?.amount || 0)
      await adminAPI.upgradeVip({
        userId: user.id,
        newVipLevelId: selectedVipId,
        adminNotes: vipAdminNotes || undefined,
        upgradedBy: 'admin_portal',
        upgradeType: newAmount >= currentAmount ? 'upgrade' : 'downgrade'
      })
      toast.success('VIP level updated successfully')
    }

    closeVipModal()
    await loadUser()
  } catch (error) {
    console.error(error)
    const message = error.response?.data?.message || error.response?.data?.error || 'Failed to update VIP level'
    toast.error(message)
  } finally {
    setVipSubmitting(false)
  }
}

  const handleToggleStatus = async () => {
    if (!user) return
    setToggling(true)
    try {
      await adminAPI.toggleUserStatus(user.id)
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`)
      await loadUser()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) return null

  const breakdown = user.financialData || {}
  const vipLevel = user.userVip?.vipLevel

  const tabs = [
    { label: 'Deposits', icon: ArrowDownCircle },
    { label: 'Withdrawals', icon: ArrowUpCircle },
    { label: 'Referrals', icon: TreePine },
    { label: 'Earnings', icon: LineChart },
    { label: 'Assign VIP', icon: Crown },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Deposits': {
        const rows = depositHistory?.deposits || []
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Deposited</p>
                <p className="text-2xl font-semibold">{formatCurrency(breakdown.totalDeposits)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Deposit Count</p>
                <p className="text-2xl font-semibold">{breakdown.totalDepositsCount || user._count?.deposits || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency((breakdown.totalDailyEarnings || 0) - (breakdown.totalDeposits || 0))}
                </p>
              </div>
            </div>
            {depositLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="h-5 w-5 animate-spin text-primary-600" />
              </div>
            ) : rows.length ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Network</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((deposit) => (
                        <tr key={deposit.id}>
                          <td className="px-4 py-2">{formatDateTime(deposit.createdAt)}</td>
                          <td className="px-4 py-2 font-semibold">{formatCurrency(deposit.amount)}</td>
                          <td className="px-4 py-2">{deposit.network || '—'}</td>
                          <td className="px-4 py-2 uppercase text-xs tracking-wide text-gray-500">{deposit.depositType || 'N/A'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              deposit.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700'
                                : deposit.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {deposit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {rows.map((deposit) => (
                    <div key={deposit.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900">{formatCurrency(deposit.amount)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          deposit.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : deposit.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {deposit.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDateTime(deposit.createdAt)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <p className="font-semibold text-gray-700">Network</p>
                        <p>{deposit.network || '—'}</p>
                        <p className="font-semibold text-gray-700">Type</p>
                        <p className="uppercase tracking-wide">{deposit.depositType || 'N/A'}</p>
                        <p className="font-semibold text-gray-700">Tx Hash</p>
                        <p className="truncate">{deposit.transactionHash || 'Not provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No deposits found for this user.</p>
            )}
          </div>
        )
      }
      case 'Withdrawals': {
        const rows = withdrawalHistory?.withdrawals || []
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="text-2xl font-semibold">{formatCurrency(breakdown.totalWithdrawn)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Withdrawal Count</p>
                <p className="text-2xl font-semibold">{breakdown.totalWithdrawalsCount || user._count?.withdrawals || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-2xl font-semibold">{formatCurrency(user.wallet?.balance)}</p>
              </div>
            </div>
            {withdrawalLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="h-5 w-5 animate-spin text-primary-600" />
              </div>
            ) : rows.length ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Network</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((withdrawal) => (
                        <tr key={withdrawal.id}>
                          <td className="px-4 py-2">{formatDateTime(withdrawal.createdAt)}</td>
                          <td className="px-4 py-2 font-semibold text-red-600">
                            -{formatCurrency(withdrawal.amount)}
                          </td>
                          <td className="px-4 py-2">{withdrawal.network || '—'}</td>
                          <td className="px-4 py-2 text-xs text-gray-500 break-all">{withdrawal.walletAddress}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              withdrawal.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : withdrawal.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : withdrawal.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {withdrawal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {rows.map((withdrawal) => (
                    <div key={withdrawal.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900 text-red-600">
                          -{formatCurrency(withdrawal.amount)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          withdrawal.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : withdrawal.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : withdrawal.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDateTime(withdrawal.createdAt)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <p className="font-semibold text-gray-700">Network</p>
                        <p>{withdrawal.network || '—'}</p>
                        <p className="font-semibold text-gray-700">Address</p>
                        <p className="col-span-1 truncate">{withdrawal.walletAddress}</p>
                        <p className="font-semibold text-gray-700">Tx Hash</p>
                        <p className="truncate">{withdrawal.transactionHash || 'Not provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No withdrawals found for this user.</p>
            )}
          </div>
        )
      }
      case 'Referrals': {
        const renderReferralNodes = (nodes, depth = 0) =>
          nodes?.map((node) => (
            <div
              key={node.id}
              className="border-l border-gray-200 pl-4 ml-4"
              style={{ marginLeft: depth ? depth * 12 : 0 }}
            >
              <div className="bg-white shadow-sm rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{node.fullName || 'Unnamed User'}</p>
                    <p className="text-xs text-gray-500">{node.email || node.phone || 'No contact info'}</p>
                  </div>
                  <span className="text-xs uppercase text-gray-400">Level {node.level}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <p>Total Deposits: {formatCurrency(node.financialData?.totalDeposits)}</p>
                  <p>Total Earnings: {formatCurrency(node.financialData?.totalDailyEarnings)}</p>
                  <p>Total Withdrawals: {formatCurrency(node.financialData?.totalWithdrawals)}</p>
                  <p>Referrals: {node._count?.referrals || 0}</p>
                </div>
              </div>
              {node.referrals?.length ? renderReferralNodes(node.referrals, depth + 1) : null}
            </div>
          ))

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Referral Code</p>
                <p className="text-xl font-semibold">{user.referralCode}</p>
                <p className="text-sm text-gray-500 mt-2">Referral Earnings</p>
                <p className="text-xl font-semibold">{formatCurrency(breakdown.referralEarnings)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-semibold">{user._count?.referrals || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Referred By</p>
                <p className="text-sm text-gray-700">
                  {user.referrer?.email || user.referrer?.phone || 'Direct signup'}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Referral Tree</h4>
              {referralLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-5 w-5 animate-spin text-primary-600" />
                </div>
              ) : referralTree && referralTree.length ? (
                <div className="space-y-3">{renderReferralNodes(referralTree)}</div>
              ) : (
                <p className="text-sm text-gray-500">No referral tree data available.</p>
              )}
            </div>
          </div>
        )
      }
      case 'Earnings':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Daily Earnings</p>
                <p className="text-2xl font-semibold">{formatCurrency(breakdown.totalDailyEarnings)}</p>
              </div>
              {earningsLoading && <Loader className="h-4 w-4 animate-spin text-primary-600" />}
            </div>
            {earnings?.transactions?.length ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {earnings.transactions.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{formatDateTime(item.createdAt)}</td>
                          <td className="px-4 py-2 font-semibold text-green-600">{formatCurrency(item.amount)}</td>
                          <td className="px-4 py-2 capitalize">{item.status || 'completed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {earnings.transactions.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900 text-green-600">{formatCurrency(item.amount)}</p>
                        <span className="text-xs uppercase text-gray-500">{(item.status || 'completed').toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No earning history available.</p>
            )}
          </div>
        )
      case 'Assign VIP':
        return (
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Current VIP</p>
              <p className="text-xl font-semibold">
                {vipLevel ? `${vipLevel.name} (${formatCurrency(vipLevel.dailyEarning)}/day)` : 'Not assigned'}
              </p>
            </div>
            <button
              onClick={() => openVipModal(user.userVip ? 'upgrade' : 'assign')}
              className="btn-primary w-full sm:w-auto"
            >
              {user.userVip ? 'Upgrade VIP Level' : 'Assign VIP Level'}
            </button>
          </div>
        )
      default:
        return null
    }
  }

  const vipModalTitle = vipModalMode === 'upgrade' ? 'Upgrade VIP Level' : 'Assign VIP Level'
  const vipPrimaryAction = vipModalMode === 'upgrade' ? 'Update VIP Level' : 'Assign VIP Level'
  const currentVipAmount = parseFloat(user?.userVip?.vipLevel?.amount || 0)
  const selectedVipAmount = parseFloat(selectedVipLevel?.amount || 0)
  const vipAmountDifference = selectedVipAmount - currentVipAmount

  return (
    <>
      <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-100 w-max"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to users
          </button>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">
            {tabs.map(({ label, icon: Icon }) => {
              const isActive = activeTab === label
              return (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'border-slate-700 text-slate-300 hover:border-primary-500 hover:text-primary-300 bg-slate-900/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-6 w-6 text-primary-400" />
                <div>
                  <p className="text-xs uppercase text-slate-400">User Overview</p>
                  <h1 className="text-2xl font-bold text-slate-50">
                    {user.fullName || 'Unnamed User'}
                  </h1>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-1">
                <p>Email: {user.email || 'N/A'} · Phone: {user.phone || 'N/A'}</p>
                <p>Referral Code: {user.referralCode}</p>
                <p>Joined: {formatDateTime(user.createdAt)}</p>
                <p>Last Updated: {formatDateTime(user.updatedAt)}</p>
              </div>
            </div>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className="inline-flex items-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800 disabled:opacity-50"
            >
              {toggling ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : user.isActive ? (
                <>
                  <ToggleLeft className="h-4 w-4" /> Suspend
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4" /> Activate
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: user.isActive ? 'Active' : 'Inactive', icon: UserCheck },
            { label: 'Balance', value: formatCurrency(user.wallet?.balance), icon: Wallet },
            { label: 'Total Deposits', value: formatCurrency(breakdown.totalDeposits), icon: ArrowDownCircle },
            { label: 'Total Earnings', value: formatCurrency(breakdown.totalDailyEarnings), icon: LineChart },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-primary-300 border border-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="text-xl font-semibold text-slate-50">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-2 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-50">Financial Summary</h3>
            <p className="text-sm text-slate-300">
              Total Deposits: <span className="font-semibold">{formatCurrency(breakdown.totalDeposits)}</span>
            </p>
            <p className="text-sm text-slate-300">
              Total Withdrawals:{' '}
              <span className="font-semibold">{formatCurrency(breakdown.totalWithdrawals)}</span>
            </p>
            <p className="text-sm text-slate-300">
              Referral Earnings:{' '}
              <span className="font-semibold">{formatCurrency(breakdown.referralEarnings)}</span>
            </p>
            <p className="text-sm text-slate-300">
              Today&apos;s Earnings:{' '}
              <span className="font-semibold">{formatCurrency(breakdown.dailyEarningToday)}</span>
            </p>
            <p className="text-sm text-slate-300">
              Total Daily Earnings:{' '}
              <span className="font-semibold">{formatCurrency(breakdown.totalDailyEarnings)}</span>
            </p>
            <p className="text-sm text-slate-300">
              Net Profit:{' '}
              <span className="font-semibold">
                {formatCurrency((breakdown.totalDailyEarnings || 0) - (breakdown.totalDeposits || 0))}
              </span>
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-2 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-50">Account Details</h3>
            <p className="text-sm text-slate-300">User ID: {user.id}</p>
            <p className="text-sm text-slate-300">Wallet ID: {user.wallet?.id || 'N/A'}</p>
            <p className="text-sm text-slate-300">
              VIP Level:{' '}
              <span className="font-semibold">
                {vipLevel ? `${vipLevel.name} (${formatCurrency(vipLevel.dailyEarning)}/day)` : 'Not assigned'}
              </span>
            </p>
            <p className="text-sm text-slate-300">Referrals: {user._count?.referrals || 0}</p>
            <p className="text-sm text-slate-300">Deposits: {user._count?.deposits || 0}</p>
            <p className="text-sm text-slate-300">Withdrawals: {user._count?.withdrawals || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
          {renderTabContent()}
        </div>
      </div>

      {vipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-50">{vipModalTitle}</h3>
              <button onClick={closeVipModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6">
              {vipLevelsLoading && !availableVipLevels.length ? (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : availableVipLevels.length ? (
                <form className="space-y-4" onSubmit={handleVipSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIP Level</label>
                    <select
                      value={selectedVipId}
                      onChange={handleVipLevelChange}
                      className="input-field"
                      required
                    >
                      <option value="" disabled>
                        Select VIP Level
                      </option>
                      {availableVipLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} — Entry {formatCurrency(level.amount)} · {formatCurrency(level.dailyEarning)} / day
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVipLevel && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">{selectedVipLevel.name}</p>
                      <p>Entry Cost: {formatCurrency(selectedVipLevel.amount)}</p>
                      <p>Daily Earning: {formatCurrency(selectedVipLevel.dailyEarning)}</p>
                    </div>
                  )}

                  {vipModalMode === 'assign' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={vipPaymentAmount}
                        onChange={(e) => setVipPaymentAmount(e.target.value)}
                        className="input-field"
                        placeholder="Enter payment amount"
                        required
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                      <p>Current Level: {user.userVip?.vipLevel?.name || 'N/A'} ({formatCurrency(currentVipAmount)})</p>
                      <p>Selected Level: {selectedVipLevel?.name || 'N/A'} ({formatCurrency(selectedVipAmount)})</p>
                      <p className="font-semibold">
                        Difference: {isNaN(vipAmountDifference) ? 'N/A' : formatCurrency(vipAmountDifference)}
                      </p>
                      {vipAmountDifference > 0 && (
                        <p className="text-xs text-amber-600">
                          Note: User balance may need manual adjustment for upgrades.
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (optional)</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Share the reason or any additional context..."
                      value={vipAdminNotes}
                      onChange={(e) => setVipAdminNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={closeVipModal} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={vipSubmitting}>
                      {vipSubmitting ? 'Saving...' : vipPrimaryAction}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">No VIP levels available to select.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

