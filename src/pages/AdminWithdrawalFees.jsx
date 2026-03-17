import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Banknote,
  Loader,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { adminAPI } from '../services/api'

const tierDefaults = {
  minAmount: '',
  maxAmount: '',
  percent: '',
  isActive: true,
}

const formatRange = (min, max) => {
  const minValue = Number(min || 0).toFixed(2)
  if (max == null || max === '') {
    return `$${minValue} +`
  }
  const maxValue = Number(max).toFixed(2)
  return `$${minValue} - $${maxValue}`
}

export default function AdminWithdrawalFees() {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tierModal, setTierModal] = useState({
    open: false,
    mode: 'create',
    data: tierDefaults,
    submitting: false,
  })
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    tier: null,
    submitting: false,
  })

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getWithdrawalFeeTiers()
      setTiers(response.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load withdrawal fees')
    } finally {
      setLoading(false)
    }
  }

  const openTierModal = (mode, tier = null) => {
    setTierModal({
      open: true,
      mode,
      data: tier
        ? {
            id: tier.id,
            minAmount: tier.minAmount ?? '',
            maxAmount: tier.maxAmount ?? '',
            percent: tier.percent ?? '',
            isActive: tier.isActive ?? true,
          }
        : tierDefaults,
      submitting: false,
    })
  }

  const closeTierModal = () => {
    setTierModal({
      open: false,
      mode: 'create',
      data: tierDefaults,
      submitting: false,
    })
  }

  const handleTierInput = (field, value) => {
    setTierModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }))
  }

  const handleTierSubmit = async (event) => {
    event.preventDefault()
    setTierModal((prev) => ({ ...prev, submitting: true }))
    const payload = {
      minAmount: Number(tierModal.data.minAmount || 0),
      percent: Number(tierModal.data.percent || 0) / 100,
      isActive: tierModal.data.isActive,
    }
    if (tierModal.data.maxAmount !== '' && tierModal.data.maxAmount != null) {
      payload.maxAmount = Number(tierModal.data.maxAmount)
    }

    if (payload.maxAmount != null && payload.maxAmount < payload.minAmount) {
      toast.error('Max amount cannot be less than min amount')
      setTierModal((prev) => ({ ...prev, submitting: false }))
      return
    }

    try {
      if (tierModal.mode === 'create') {
        await adminAPI.createWithdrawalFeeTier(payload)
        toast.success('Fee tier created')
      } else {
        await adminAPI.updateWithdrawalFeeTier(tierModal.data.id, payload)
        toast.success('Fee tier updated')
      }
      closeTierModal()
      await loadTiers()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save fee tier')
      setTierModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  const openDeleteConfirm = (tier) => {
    setDeleteConfirm({
      open: true,
      tier,
      submitting: false,
    })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      open: false,
      tier: null,
      submitting: false,
    })
  }

  const handleDeleteTier = async () => {
    if (!deleteConfirm.tier) return
    setDeleteConfirm((prev) => ({ ...prev, submitting: true }))
    try {
      await adminAPI.deleteWithdrawalFeeTier(deleteConfirm.tier.id)
      toast.success('Fee tier deleted')
      closeDeleteConfirm()
      await loadTiers()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to delete fee tier')
      setDeleteConfirm((prev) => ({ ...prev, submitting: false }))
    }
  }

  const coverageCheck = useMemo(() => {
    if (!tiers.length) return null
    const sorted = [...tiers]
      .filter((tier) => tier.isActive)
      .map((tier) => ({
        id: tier.id,
        min: parseFloat(tier.minAmount),
        max: tier.maxAmount != null ? parseFloat(tier.maxAmount) : Infinity,
      }))
      .sort((a, b) => a.min - b.min)

    const gaps = []
    const overlaps = []
    let cursor = 0
    for (const tier of sorted) {
      if (tier.min > cursor) {
        gaps.push([cursor, tier.min])
      }
      if (tier.min < cursor) {
        overlaps.push(tier.id)
      }
      cursor = Math.max(cursor, tier.max)
    }
    return { gaps, overlaps }
  }, [tiers])

  return (
    <div className="relative min-h-screen bg-slate-950/95 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
              <Banknote className="h-7 w-7 text-emerald-400" />
              Withdrawal Fees
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              Configure tiered withdrawal fee percentages with precise amount ranges.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadTiers}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm hover:bg-slate-800 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => openTierModal('create')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Add Fee Tier
            </button>
          </div>
        </div>

        {coverageCheck && (coverageCheck.gaps.length > 0 || coverageCheck.overlaps.length > 0) && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-100 px-4 py-3 sm:px-6 sm:py-4 text-sm flex items-start gap-3 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-300" />
            <div>
              <p className="font-semibold">Attention: Some fee tiers need review.</p>
              {coverageCheck.gaps.length > 0 && (
                <p className="mt-1 text-amber-100/90">
                  • Gaps detected between amounts{' '}
                  {coverageCheck.gaps
                    .map(([from, to]) => `$${from.toFixed(2)} - $${to.toFixed(2)}`)
                    .join(', ')}
                </p>
              )}
              {coverageCheck.overlaps.length > 0 && (
                <p className="mt-1 text-amber-100/90">
                  • Overlapping tiers detected. Please adjust the ranges.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : tiers.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              No withdrawal fee tiers configured yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Range
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-400 uppercase text-xs">
                        Percent
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
                    {tiers.map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-4 py-3 text-slate-100">
                          {formatRange(tier.minAmount, tier.maxAmount)}
                        </td>
                        <td className="px-4 py-3 text-emerald-300 font-semibold">
                          {(Number(tier.percent || 0) * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              tier.isActive
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-700/60 text-slate-300 border-slate-500/40'
                            }`}
                          >
                            {tier.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openTierModal('edit', tier)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(tier)}
                            className="inline-flex items-center gap-2 text-xs rounded-xl border border-red-500/60 text-red-300 px-3 py-2 font-medium bg-red-500/10 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 space-y-2 shadow-lg"
                  >
                    <p className="text-sm font-semibold text-slate-50">
                      {formatRange(tier.minAmount, tier.maxAmount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Fee:{' '}
                      <span className="font-semibold text-emerald-300">
                        {(Number(tier.percent || 0) * 100).toFixed(2)}%
                      </span>
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${
                        tier.isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700/60 text-slate-300 border-slate-500/40'
                      }`}
                    >
                      {tier.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openTierModal('edit', tier)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(tier)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/60 text-red-300 text-xs font-medium py-2 bg-red-500/10 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {tierModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-50">
                {tierModal.mode === 'create' ? 'Create Fee Tier' : 'Edit Fee Tier'}
              </h3>
              <button onClick={closeTierModal} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleTierSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-300 flex flex-col gap-1">
                  Min Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tierModal.data.minAmount}
                    onChange={(e) => handleTierInput('minAmount', e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                    required
                  />
                </label>
                <label className="text-sm text-slate-300 flex flex-col gap-1">
                  Max Amount (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tierModal.data.maxAmount}
                    onChange={(e) => handleTierInput('maxAmount', e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                    placeholder="Leave blank for no upper limit"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-300 flex flex-col gap-1">
                Fee Percent
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.1"
                      value={tierModal.data.percent || 0}
                      onChange={(e) => handleTierInput('percent', e.target.value)}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tierModal.data.percent}
                    onChange={(e) => handleTierInput('percent', e.target.value)}
                    className="w-24 rounded-xl border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-sm text-slate-100 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                    required
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
                <p className="text-xs text-slate-500">
                  Example: 3.5% fee (enter 3.5). Slider capped at 20% for convenience.
                </p>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={tierModal.data.isActive}
                  onChange={(e) => handleTierInput('isActive', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                Active tier
              </label>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTierModal}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60"
                  disabled={tierModal.submitting}
                >
                  {tierModal.submitting
                    ? 'Saving...'
                    : tierModal.mode === 'create'
                    ? 'Create Tier'
                    : 'Update Tier'}
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
              <h3 className="text-lg font-semibold text-slate-50">Delete Fee Tier</h3>
              <button onClick={closeDeleteConfirm} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-300">
              <p>
                Are you sure you want to delete the tier covering{' '}
                <span className="font-semibold text-slate-50">
                  {formatRange(deleteConfirm.tier?.minAmount, deleteConfirm.tier?.maxAmount)}
                </span>
                ?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTier}
                  className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-red-500/30 hover:bg-red-400 disabled:opacity-60"
                  disabled={deleteConfirm.submitting}
                >
                  {deleteConfirm.submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

