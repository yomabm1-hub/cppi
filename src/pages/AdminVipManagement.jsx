import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Crown,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  Filter,
  Loader,
  ArrowLeft,
} from 'lucide-react'
import { adminAPI } from '../services/api'

const levelDefaults = {
  name: '',
  amount: '',
  dailyEarning: '',
  bicycleModel: '',
  bicycleColor: '',
  bicycleFeatures: '',
  isActive: true,
}

const memberPageSize = 20

export default function AdminVipManagement() {
  const [activeTab, setActiveTab] = useState('levels')
  const [levels, setLevels] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(true)

  const [levelModal, setLevelModal] = useState({
    open: false,
    mode: 'create',
    data: levelDefaults,
    submitting: false,
  })

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    level: null,
    submitting: false,
  })

  const [members, setMembers] = useState([])
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberPagination, setMemberPagination] = useState(null)
  const [memberPage, setMemberPage] = useState(1)
  const [memberFilters, setMemberFilters] = useState({
    levelId: '',
    search: '',
  })
  const [memberSearchInput, setMemberSearchInput] = useState('')

  useEffect(() => {
    loadLevels()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMemberFilters((prev) => ({ ...prev, search: memberSearchInput }))
      setMemberPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [memberSearchInput])

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers()
    }
  }, [activeTab, memberPage, memberFilters.levelId, memberFilters.search])

  const loadLevels = async () => {
    setLevelsLoading(true)
    try {
      const response = await adminAPI.getVipLevels()
      setLevels(response.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load VIP levels')
    } finally {
      setLevelsLoading(false)
    }
  }

  const loadMembers = async () => {
    setMemberLoading(true)
    try {
      const response = await adminAPI.getVipMembers({
        page: memberPage,
        limit: memberPageSize,
        levelId: memberFilters.levelId || undefined,
        search: memberFilters.search || undefined,
      })
      setMembers(response.data.data || [])
      setMemberPagination(response.data.pagination)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load VIP members')
    } finally {
      setMemberLoading(false)
    }
  }

  const openLevelModal = (mode, level = null) => {
    setLevelModal({
      open: true,
      mode,
      data: level
        ? {
            name: level.name || '',
            amount: level.amount || '',
            dailyEarning: level.dailyEarning || '',
            bicycleModel: level.bicycleModel || '',
            bicycleColor: level.bicycleColor || '',
            bicycleFeatures: level.bicycleFeatures || '',
            isActive: level.isActive ?? true,
            id: level.id,
          }
        : levelDefaults,
      submitting: false,
    })
  }

  const closeLevelModal = () => {
    setLevelModal({
      open: false,
      mode: 'create',
      data: levelDefaults,
      submitting: false,
    })
  }

  const handleLevelInput = (field, value) => {
    setLevelModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }))
  }

  const handleLevelSubmit = async (event) => {
    event.preventDefault()
    setLevelModal((prev) => ({ ...prev, submitting: true }))
    const payload = {
      name: levelModal.data.name,
      amount: Number(levelModal.data.amount),
      dailyEarning: Number(levelModal.data.dailyEarning),
      bicycleModel: levelModal.data.bicycleModel || undefined,
      bicycleColor: levelModal.data.bicycleColor || undefined,
      bicycleFeatures: levelModal.data.bicycleFeatures || undefined,
      isActive: levelModal.data.isActive,
    }

    try {
      if (levelModal.mode === 'create') {
        await adminAPI.createVipLevel(payload)
        toast.success('VIP level created')
      } else {
        await adminAPI.updateVipLevel(levelModal.data.id, payload)
        toast.success('VIP level updated')
      }
      closeLevelModal()
      await loadLevels()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save VIP level')
      setLevelModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  const openDeleteConfirm = (level) => {
    setDeleteConfirm({
      open: true,
      level,
      submitting: false,
    })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      open: false,
      level: null,
      submitting: false,
    })
  }

  const handleDeleteLevel = async () => {
    if (!deleteConfirm.level) return
    setDeleteConfirm((prev) => ({ ...prev, submitting: true }))
    try {
      await adminAPI.deleteVipLevel(deleteConfirm.level.id)
      toast.success('VIP level deleted')
      closeDeleteConfirm()
      await loadLevels()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to delete VIP level')
      setDeleteConfirm((prev) => ({ ...prev, submitting: false }))
    }
  }

  const handleViewMembers = (levelId) => {
    setMemberFilters((prev) => ({ ...prev, levelId }))
    setMemberPage(1)
    setActiveTab('members')
  }

  const summaryCards = useMemo(
    () => [
      {
        label: 'Active Levels',
        value: levels.filter((lvl) => lvl.isActive).length,
        helper: `${levels.length} total`,
      },
      {
        label: 'Average Daily Earning',
        value:
          levels.length > 0
            ? `$${(
                levels.reduce((sum, lvl) => sum + Number(lvl.dailyEarning || 0), 0) / levels.length
              ).toFixed(2)}`
            : '$0.00',
        helper: 'Across all levels',
      },
      {
        label: 'Lowest Entry',
        value:
          levels.length > 0
            ? `$${Math.min(...levels.map((lvl) => Number(lvl.amount || 0))).toFixed(2)}`
            : '$0.00',
        helper: 'Minimum buy-in',
      },
    ],
    [levels]
  )

  return (
    <>
      <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Crown className="h-7 w-7 text-amber-300" />
              VIP Levels & Members
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300">
              Edit VIP tiers and review the members enrolled in each level.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadLevels}
              className="btn-secondary bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
            >
              Refresh
            </button>
            <button
              onClick={() => openLevelModal('create')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add VIP Level
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
          <p className="text-sm font-semibold text-slate-900/90 mb-1">VIP program control</p>
          <p className="text-sm text-slate-800/90">
            Configure tiered VIP levels and inspect members in each tier, aligned with the VIP page
            design.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-2">
          {[
            { key: 'levels', label: 'VIP Levels' },
            { key: 'members', label: 'Members' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'border-slate-700 text-slate-300 bg-slate-900/60 hover:border-primary-500 hover:text-primary-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'levels' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 shadow-xl"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.helper}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
              {levelsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="h-6 w-6 animate-spin text-primary-400" />
                </div>
              ) : levels.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No VIP levels defined yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {levels.map((level, index) => {
                    const isActive = level.isActive
                    const gradient =
                      index % 3 === 0
                        ? 'from-teal-500/30 via-emerald-500/30 to-green-500/30'
                        : index % 3 === 1
                        ? 'from-violet-500/30 via-purple-500/30 to-fuchsia-500/30'
                        : 'from-pink-500/30 via-rose-500/30 to-red-500/30'

                    return (
                      <div
                        key={level.id}
                        className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700 p-4 flex flex-col h-full shadow-xl"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 opacity-60 bg-gradient-to-br ${gradient}`}
                        />
                        <div className="relative flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase text-slate-300">Level</p>
                            <h3 className="text-xl font-semibold text-slate-50">
                              {level.name}
                            </h3>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50'
                                : 'bg-slate-700/70 text-slate-300 border-slate-500/60'
                            }`}
                          >
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="relative mt-4 space-y-2 text-sm text-slate-200 flex-1">
                          <p>
                            Entry Amount:{' '}
                            <span className="font-semibold text-slate-50">
                              ${Number(level.amount || 0).toFixed(2)}
                            </span>
                          </p>
                          <p>
                            Daily Earning:{' '}
                            <span className="font-semibold text-emerald-300">
                              ${Number(level.dailyEarning || 0).toFixed(2)}
                            </span>
                          </p>
                          {level.bicycleModel && <p>Bicycle: {level.bicycleModel}</p>}
                          {level.bicycleColor && <p>Color: {level.bicycleColor}</p>}
                          {level.bicycleFeatures && (
                            <p className="text-xs text-slate-200">{level.bicycleFeatures}</p>
                          )}
                        </div>
                        <div className="relative mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewMembers(level.id)}
                            className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800"
                          >
                            <Users className="h-4 w-4" />
                            Members
                          </button>
                          <button
                            onClick={() => openLevelModal('edit', level)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 text-slate-100 text-sm font-medium py-2 bg-slate-900 hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(level)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 text-red-300 text-sm font-medium py-2 bg-red-500/15"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearchInput}
                    onChange={(e) => setMemberSearchInput(e.target.value)}
                    placeholder="Search members by name, email, phone..."
                    className="w-full pl-10 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                    <select
                      value={memberFilters.levelId}
                      onChange={(e) => {
                        setMemberFilters((prev) => ({ ...prev, levelId: e.target.value }))
                        setMemberPage(1)
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    >
                      <option value="">All levels</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberFilters({ levelId: '', search: '' })
                      setMemberSearchInput('')
                      setMemberPage(1)
                    }}
                    className="btn-secondary bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 sm:p-6 shadow-xl">
              {memberLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="h-6 w-6 animate-spin text-primary-400" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No VIP members found.</p>
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
                            VIP Level
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950">
                        {members.map((member) => (
                          <tr key={member.id}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-50">
                                {member.user?.fullName || 'Unnamed User'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {member.user?.email || member.user?.phone || 'No contact'}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-50">
                                {member.vipLevel?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-400">
                                ${Number(member.vipLevel?.dailyEarning || 0).toFixed(2)} / day
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {member.joinedAt
                                ? new Date(member.joinedAt).toLocaleDateString()
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Link
                                to={`/admin/users/${member.userId}`}
                                className="btn-secondary inline-flex items-center gap-2 text-xs bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800"
                              >
                                <Users className="h-4 w-4" />
                                View User
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="border border-slate-700 rounded-2xl p-4 bg-slate-900/80 space-y-2 shadow-md"
                      >
                        <p className="text-sm font-semibold text-slate-50">
                          {member.user?.fullName || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {member.user?.email || member.user?.phone || 'No contact info'}
                        </p>
                        <p className="text-sm text-slate-200">
                          Level:{' '}
                          <span className="font-semibold text-slate-50">
                            {member.vipLevel?.name || 'N/A'} ($
                            {Number(member.vipLevel?.dailyEarning || 0).toFixed(2)} / day)
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Joined{' '}
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString()
                            : '—'}
                        </p>
                        <Link
                          to={`/admin/users/${member.userId}`}
                          className="btn-secondary w-full inline-flex items-center justify-center gap-2 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                        >
                          <Users className="h-4 w-4" />
                          View User
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {members.length > 0 && memberPagination && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    Page {memberPagination.currentPage} of {memberPagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMemberPage((prev) => Math.max(1, prev - 1))}
                      disabled={memberPage === 1}
                      className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setMemberPage((prev) =>
                          Math.min(memberPagination.totalPages, prev + 1)
                        )
                      }
                      disabled={memberPage === memberPagination.totalPages}
                      className="btn-secondary disabled:opacity-50 bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {levelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-50">
                {levelModal.mode === 'create' ? 'Create VIP Level' : 'Edit VIP Level'}
              </h3>
              <button
                onClick={closeLevelModal}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleLevelSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-200 flex flex-col gap-1">
                  Name
                  <input
                    type="text"
                    value={levelModal.data.name}
                    onChange={(e) => handleLevelInput('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </label>
                <label className="text-sm text-slate-200 flex flex-col gap-1">
                  Entry Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={levelModal.data.amount}
                    onChange={(e) => handleLevelInput('amount', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </label>
                <label className="text-sm text-slate-200 flex flex-col gap-1">
                  Daily Earning
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={levelModal.data.dailyEarning}
                    onChange={(e) => handleLevelInput('dailyEarning', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </label>
                <label className="text-sm text-slate-200 flex flex-col gap-1">
                  Bicycle Model
                  <input
                    type="text"
                    value={levelModal.data.bicycleModel}
                    onChange={(e) => handleLevelInput('bicycleModel', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-200 flex flex-col gap-1">
                Bicycle Color
                <input
                  type="text"
                  value={levelModal.data.bicycleColor}
                  onChange={(e) => handleLevelInput('bicycleColor', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </label>
              <label className="text-sm text-slate-200 flex flex-col gap-1">
                Bicycle Features
                <textarea
                  rows={3}
                  value={levelModal.data.bicycleFeatures}
                  onChange={(e) => handleLevelInput('bicycleFeatures', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={levelModal.data.isActive}
                  onChange={(e) => handleLevelInput('isActive', e.target.checked)}
                  className="rounded border-slate-600 text-primary-400 bg-slate-900 focus:ring-primary-500"
                />
                Active level
              </label>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeLevelModal}
                  className="btn-secondary bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={levelModal.submitting}>
                  {levelModal.submitting
                    ? 'Saving...'
                    : levelModal.mode === 'create'
                    ? 'Create Level'
                    : 'Update Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-50">Delete VIP Level</h3>
              <button
                onClick={closeDeleteConfirm}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-300">
              <p>
                Are you sure you want to delete the VIP level{' '}
                <span className="font-semibold text-slate-50">{deleteConfirm.level?.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  className="btn-secondary bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLevel}
                  className="btn-primary"
                  disabled={deleteConfirm.submitting}
                >
                  {deleteConfirm.submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

