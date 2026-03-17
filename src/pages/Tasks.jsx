import { useEffect, useState } from 'react'
import { taskAPI } from '../services/api'
import { ListChecks, Play, Clock, Gift, Calendar, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Tasks() {
  const [availableTasks, setAvailableTasks] = useState([])
  const [earningStatus, setEarningStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksData, statusData, historyData] = await Promise.all([
        taskAPI.getAvailable(),
        taskAPI.getEarningStatus(),
        taskAPI.getHistory(),
      ])

      setAvailableTasks(tasksData?.data?.data || tasksData?.data?.tasks || [])
      setEarningStatus(statusData?.data || {})
      const historyList =
        historyData?.data?.tasks ||
        historyData?.data?.data ||
        historyData?.data?.sessions ||
        []
      setHistory(Array.isArray(historyList) ? historyList : [])
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleStartEarning = async () => {
    setStarting(true)
    try {
      await taskAPI.startEarning()
      toast.success('Daily earning task started!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start task')
    } finally {
      setStarting(false)
    }
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const activeTask = earningStatus?.data?.activeTask
  const isActive = activeTask && activeTask.status === 'IN_PROGRESS'

  const getHistoryStatusColor = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    if (status === 'IN_PROGRESS') return 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
    return 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
          <ListChecks className="h-7 w-7 text-primary-400" />
          Tasks
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">Complete tasks to earn rewards</p>
      </div>

      {/* How it works - warm orange strip */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">How tasks work</p>
        <p className="text-sm text-slate-800/90">
          Start daily earning tasks to receive rewards. Some tasks require a VIP level. Complete them before cooldown to earn again.
        </p>
      </div>

      {/* Active Task - gradient card (emerald/teal like VIP level 1) */}
      {isActive && activeTask && (
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 text-white shadow-xl p-5 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Clock className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">Active Task</h2>
                <p className="text-white/90">{activeTask.task?.title || 'Daily Earning'}</p>
                {activeTask.startedAt && (
                  <p className="text-white/80 text-sm mt-1">
                    Started: {formatDate(activeTask.startedAt)}
                  </p>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/80 text-sm">Reward</p>
              <p className="text-2xl font-bold text-white">
                ${parseFloat(activeTask.task?.reward || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Available Tasks
          </h2>
        </div>
        <div className="p-5 sm:p-6">
          {availableTasks.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No tasks available</p>
          ) : (
            <div className="space-y-4">
              {availableTasks.map((task) => {
                const rewardAmount = parseFloat(task.nextReward ?? task.reward ?? 0)
                const rewardLabel = rewardAmount ? `$${rewardAmount.toFixed(2)}` : 'N/A'
                const cooldownLabel =
                  task.cooldownRemaining && task.cooldownRemaining.hours !== undefined
                    ? `${task.cooldownRemaining.hours}h ${task.cooldownRemaining.minutes % 60}m`
                    : null

                return (
                  <div
                    key={task.id}
                    className="p-4 sm:p-5 rounded-xl bg-slate-900/60 border border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                          <h3 className="text-lg font-semibold text-slate-50">{task.title}</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-slate-300">
                            <Gift className="h-4 w-4 text-amber-400" />
                            Reward: <span className="font-semibold text-emerald-400">{rewardLabel}</span>
                            {task.vipLevelName && (
                              <span className="text-xs text-slate-500">({task.vipLevelName} VIP)</span>
                            )}
                          </span>
                          {task.isRepeatable && (
                            <span className="px-2.5 py-1 bg-primary-500/20 text-primary-300 border border-primary-500/40 rounded-full text-xs font-medium">
                              Repeatable
                            </span>
                          )}
                        </div>
                        {task.message && (
                          <p className="text-xs text-slate-500 mt-2">{task.message}</p>
                        )}
                      </div>
                      <div className="sm:text-right space-y-2 shrink-0">
                        {task.type === 'DAILY_EARNING' && task.canStart ? (
                          <button
                            onClick={handleStartEarning}
                            disabled={starting}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-50"
                          >
                            {starting ? (
                              'Starting...'
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Earn {rewardLabel}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-block px-3 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium border border-slate-600">
                            {isActive
                              ? 'In Progress'
                              : task.status === 'COOLDOWN'
                              ? 'Cooldown'
                              : task.vipLevelName
                              ? 'Completed'
                              : 'Locked'}
                          </span>
                        )}
                        {task.status === 'COOLDOWN' && cooldownLabel && (
                          <p className="text-xs text-slate-400">Next in {cooldownLabel}</p>
                        )}
                        {!task.vipLevelName && !task.canStart && task.status !== 'COOLDOWN' && (
                          <p className="text-xs text-slate-500">Join a VIP level to unlock.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task History */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-400" />
            Task History
          </h2>
        </div>
        <div className="p-5 sm:p-6">
          {history.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No task history</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/60">
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Task</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Started</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {history.map((item) => (
                    <tr key={item.id} className="bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-50">{item.task?.title || 'N/A'}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getHistoryStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {item.startedAt ? formatDate(item.startedAt) : 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {item.completedAt ? formatDate(item.completedAt) : 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-emerald-400">
                        {item.rewardEarned ? `$${parseFloat(item.rewardEarned).toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
