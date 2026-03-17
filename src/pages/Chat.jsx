import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { chatAPI } from '../services/api'
import { Send, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const { user } = useAuth()
  const { socket, connected, sendMessage } = useChat()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    loadConversation()
  }, [])

  useEffect(() => {
    if (!socket) return
    const onMessage = (msg) => {
      setConversation((prev) => {
        if (!prev) return { messages: [msg] }
        if (prev.messages.some((m) => m.id === msg.id)) return prev
        return { ...prev, messages: [...prev.messages, msg] }
      })

      const isFromAdmin = msg.sender?.isAdmin && msg.senderId !== user?.id
      if (isFromAdmin) {
        toast.success(
          <div>
            <p className="font-semibold text-slate-900">New message from Support</p>
            <p className="text-sm text-slate-600 mt-1">{msg.content.slice(0, 50)}...</p>
          </div>,
          {
            duration: 4000,
            icon: '💬',
            position: 'top-right',
          }
        )
      }
    }
    const onError = (e) => toast.error(e?.message || 'Chat error')
    socket.on('chat:message', onMessage)
    socket.on('chat:error', onError)
    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:error', onError)
    }
  }, [socket, user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  const loadConversation = async () => {
    try {
      const res = await chatAPI.getMyConversation()
      setConversation(res.data.conversation)
    } catch (err) {
      toast.error('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')

    const sent = sendMessage(text)
    if (sent) {
      toast.success('Message sent!', { duration: 2000 })
      setSending(false)
      return
    }

    try {
      const res = await chatAPI.sendMessage(text)
      setConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), res.data.message],
      }))
      toast.success('Message sent!', { duration: 2000 })
    } catch (err) {
      toast.error('Failed to send message')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const messages = conversation?.messages || []

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-primary-400" />
          Support Chat
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">Chat with our support team</p>
      </div>

      {/* Info strip - warm orange */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30 mb-6">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Need help?</p>
        <p className="text-sm text-slate-800/90">
          Send a message below. Our team will reply as soon as possible. You can also use the chat button on other pages.
        </p>
      </div>

      {/* Chat box - slate card */}
      <div className="flex-1 flex flex-col min-h-[400px] max-w-2xl w-full mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl overflow-hidden">
        {/* Chat header bar */}
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-full bg-primary-500/20 border border-primary-500/40 flex-shrink-0">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-50 truncate">Support</p>
              <p className="text-xs text-slate-400 truncate">We typically reply within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {connected ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Wifi className="h-4 w-4" /> <span className="hidden sm:inline">Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <WifiOff className="h-4 w-4" /> <span className="hidden sm:inline">Connecting...</span>
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 min-h-[300px]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 px-4">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-md'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-primary-400 mb-0.5">
                            {msg.sender?.fullName || 'Support'}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs mt-1 ${
                            isMe ? 'text-primary-200' : 'text-slate-500'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/80 flex-shrink-0 safe-area-inset-bottom">
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
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-600 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[56px]"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
