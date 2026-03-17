import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { announcementAPI } from '../services/api'
import {
  Megaphone,
  Loader,
  Pin,
  PinOff,
  CheckCircle,
  AlertTriangle,
  Archive,
} from 'lucide-react'

const priorityBadge = {
  URGENT: 'bg-red-500/20 text-red-300 border border-red-500/40',
  HIGH: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  NORMAL: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
}

const statusBadge = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  DRAFT: 'bg-slate-700/60 text-slate-300 border border-slate-500/40',
  ARCHIVED: 'bg-slate-800/80 text-slate-400 border border-slate-600/60',
}

const defaultForm = {
  title: '',
  message: '',
  priority: 'NORMAL',
  status: 'ACTIVE',
  ctaLabel: '',
  ctaUrl: '',
  expiresAt: '',
  isPinned: false,
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await announcementAPI.adminList()
      setAnnouncements(response.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    // Prevent creating announcements that are already expired
    if (form.expiresAt) {
      const expiresAtDate = new Date(form.expiresAt)
      const now = new Date()
      if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate <= now) {
        toast.error('Expiry time must be in the future')
        return
      }
    }

    setSaving(true)
    try {
      await announcementAPI.adminCreate({
        ...form,
        status: form.status || 'ACTIVE',
        ctaLabel: form.ctaLabel || undefined,
        ctaUrl: form.ctaUrl || undefined,
        expiresAt: form.expiresAt || undefined,
      })
      toast.success('Announcement published')
      setForm(defaultForm)
      loadAnnouncements()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id, payload, successMessage) => {
    try {
      await announcementAPI.adminUpdate(id, payload)
      toast.success(successMessage)
      loadAnnouncements()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  const handleArchive = async (id) => {
    try {
      await announcementAPI.adminArchive(id)
      toast.success('Announcement archived')
      loadAnnouncements()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Archive failed')
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950/95 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-slate-50">
              <Megaphone className="h-7 w-7 text-emerald-400" />
              Announcements
            </h1>
            <p className="text-sm text-slate-400">
              Publish important updates for all members across the platform.
            </p>
          </div>
          <button
            onClick={loadAnnouncements}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 via-sky-500/15 to-purple-500/20 px-4 py-3 sm:px-6 sm:py-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-slate-950/80 p-2 shadow-md border border-emerald-500/60">
              <Megaphone className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-50">
                Reach your entire community in one click
              </p>
              <p className="text-xs text-emerald-100/90 mt-1">
                Use pinned, urgent, or scheduled announcements for maintenance windows, product
                launches, and critical alerts.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-emerald-100/80">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1">
              Global reach
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1">
              Priority &amp; expiry
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Create Announcement</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-200">Title</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Platform upgrade notice"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-200">Priority</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-200">Status</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-200">Message</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                placeholder="Scheduled maintenance will occur on..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-200">CTA Label</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  placeholder="Learn more"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">CTA URL</label>
                <input
                  type="url"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                  value={form.ctaUrl}
                  onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">Expires At</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              Pin this announcement
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Megaphone className="h-4 w-4" />
              )}
              Publish
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-50">Recent Announcements</h2>
            <span className="text-sm text-slate-400">{announcements.length} total</span>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 sm:p-5 shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priorityBadge[announcement.priority]}`}
                        >
                          {announcement.priority}
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge[announcement.status]}`}
                        >
                          {announcement.status}
                        </span>
                        {announcement.isPinned && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/50 flex items-center gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-50">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-slate-300 whitespace-pre-line">
                        {announcement.message}
                      </p>
                      {announcement.ctaUrl && (
                        <a
                          href={announcement.ctaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          {announcement.ctaLabel || 'Open link'}
                        </a>
                      )}
                      <p className="text-xs text-slate-500">
                        Updated {new Date(announcement.updatedAt).toLocaleString()} ·{' '}
                        {announcement._count?.reads || 0} reads
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          handleUpdate(
                            announcement.id,
                            { isPinned: !announcement.isPinned },
                            announcement.isPinned ? 'Announcement unpinned' : 'Announcement pinned'
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                      >
                        {announcement.isPinned ? (
                          <>
                            <PinOff className="h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4" />
                            Pin
                          </>
                        )}
                      </button>

                      {announcement.status !== 'ARCHIVED' && (
                        <button
                          onClick={() =>
                            handleUpdate(
                              announcement.id,
                              {
                                status: announcement.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
                              },
                              `Announcement ${
                                announcement.status === 'ACTIVE' ? 'paused' : 'activated'
                              }`
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                        >
                          {announcement.status === 'ACTIVE' ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                              Pause
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              Activate
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleArchive(announcement.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </button>
                    </div>
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

