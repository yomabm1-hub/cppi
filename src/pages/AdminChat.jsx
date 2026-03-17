import { useEffect, useState, useRef } from 'react'
import { useChat } from '../contexts/ChatContext'
import { chatAPI } from '../services/api'
import { MessageCircle, Send, Wifi, WifiOff, User, Menu, X, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminChat() {
  const { socket, connected, sendMessage } = useChat()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [convLoading, setConvLoading] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selected) loadConversation(selected)
  }, [selected])

  useEffect(() => {
    if (!socket) return
    const onMessage = (msg) => {
      setConversation((prev) => {
        if (!prev) return null
        if (prev.messages.some((m) => m.id === msg.id)) return prev
        return { ...prev, messages: [...prev.messages, msg] }
      })
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === msg.conversationId) return { ...c, updatedAt: msg.createdAt }
          return c
        })
      )
    }
    const onError = (e) => toast.error(e?.message || 'Chat error')
    socket.on('chat:message', onMessage)
    socket.on('chat:error', onError)
    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:error', onError)
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  const loadConversations = async () => {
    try {
      const res = await chatAPI.adminGetConversations()
      setConversations(res.data.conversations || [])
    } catch (err) {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (id) => {
    setConvLoading(true)
    try {
      const res = await chatAPI.adminGetConversation(id)
      setConversation(res.data.conversation)
    } catch (err) {
      toast.error('Failed to load conversation')
    } finally {
      setConvLoading(false)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !selected || sending) return

    setSending(true)
    setInput('')

    const sent = sendMessage(text, selected)
    if (sent) {
      toast.success('Reply sent!', { duration: 2000 })
      setSending(false)
      return
    }

    try {
      await chatAPI.adminReply(selected, text)
      loadConversation(selected)
      toast.success('Reply sent!', { duration: 2000 })
    } catch (err) {
      toast.error('Failed to send reply')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleSelectConversation = (id) => {
    setSelected(id)
    setShowConversations(false) // Close conversations list on mobile after selection
  }

  const currentUser = conversation?.user
  const messages = conversation?.messages || []

  return (
    <div className="relative min-h-screen bg-slate-950/95 py-4 sm:py-6 -mx-4 sm:mx-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[calc(100vh-7rem)] flex flex-col sm:flex-row gap-4">
      {/* Conversations Sidebar - Hidden on mobile, shown as overlay */}
      <div
        className={`${
          showConversations ? 'fixed inset-0 z-50' : 'hidden'
        } sm:block sm:relative sm:z-auto`}
      >
        {/* Mobile backdrop */}
        {showConversations && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setShowConversations(false)}
          />
        )}
        
        {/* Conversations List */}
        <div className="w-80 h-full sm:h-auto flex-shrink-0 bg-slate-900/80 rounded-none sm:rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col relative z-50 sm:z-auto">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <h2 className="font-semibold text-slate-50 text-sm sm:text-base">Conversations</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {connected ? (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-300">
                    <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-300">
                    <WifiOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Connecting...
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowConversations(false)}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-950/60" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-400" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-xs sm:text-sm text-slate-500">No conversations yet</p>
            ) : (
              conversations.map((c) => {
                const last = c.messages?.[0]
                const isActive = selected === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 active:bg-slate-800/80 sm:hover:bg-slate-800/80 touch-manipulation ${
                      isActive ? 'bg-emerald-500/20 border-l-4 border-l-emerald-400' : ''
                    }`}
                  >
                    <p className="font-medium text-slate-50 truncate text-sm sm:text-base">
                      {c.user?.fullName || c.user?.email || c.user?.phone || 'User'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {c.user?.referralCode && `Ref: ${c.user.referralCode}`}
                    </p>
                    {last && (
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                        {last.content}
                      </p>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-slate-900/80 rounded-none sm:rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 px-4">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-slate-700" />
              <p className="text-sm sm:text-base">Select a conversation to view messages</p>
              <button
                onClick={() => setShowConversations(true)}
                className="mt-4 sm:hidden px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg font-medium active:bg-emerald-600"
              >
                View Conversations
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900 flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowConversations(true)}
                className="sm:hidden p-1.5 text-slate-400 hover:text-slate-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="sm:hidden p-1.5 text-slate-400 hover:text-slate-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="p-1.5 sm:p-2 rounded-full bg-emerald-500/20 flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-50 text-sm sm:text-base truncate">
                  {currentUser?.fullName || currentUser?.email || currentUser?.phone || 'User'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate">
                  {currentUser?.referralCode && `Ref: ${currentUser.referralCode}`}
                  {currentUser?.email && ` • ${currentUser.email}`}
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-950/60 min-h-0"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {convLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-emerald-400" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isAdmin = msg.sender?.isAdmin
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 ${
                            isAdmin
                              ? 'bg-emerald-500 text-slate-950 rounded-br-md shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800/90 text-slate-50 border border-slate-600 rounded-bl-md'
                          }`}
                        >
                          {!isAdmin && (
                            <p className="text-[10px] sm:text-xs font-medium text-emerald-300 mb-0.5">
                              {msg.sender?.fullName || 'User'}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${
                              isAdmin ? 'text-emerald-900' : 'text-slate-400'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0 safe-area-inset-bottom">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 sm:px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent outline-none touch-manipulation"
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-medium active:bg-emerald-600 sm:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 touch-manipulation min-w-[56px] sm:min-w-auto"
                  aria-label="Send reply"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Reply</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
