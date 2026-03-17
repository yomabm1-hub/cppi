import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { chatAPI } from '../services/api'
import { MessageCircle, X, Send, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function FloatingChatButton() {
  const { user } = useAuth()
  const { socket, connected, sendMessage } = useChat()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastReadMessageId, setLastReadMessageId] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const isChatPage = location.pathname === '/chat'

  useEffect(() => {
    if (isChatPage) {
      setIsOpen(false)
      setUnreadCount(0)
    }
  }, [isChatPage])

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
        setUnreadCount((prev) => prev + 1)

        toast.success(
          <div>
            <p className="font-semibold text-slate-900">New message from Support</p>
            <p className="text-sm text-slate-600 mt-1">{msg.content.slice(0, 50)}...</p>
          </div>,
          {
            duration: 5000,
            icon: '💬',
            position: 'top-right',
          }
        )

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Support Message', {
            body: msg.content.slice(0, 100),
            icon: '/CP-Investment.png',
          })
        }
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
    if (isOpen && conversation?.messages) {
      setTimeout(() => {
        messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

      const lastMessage = conversation.messages[conversation.messages.length - 1]
      if (lastMessage && lastMessage.id !== lastReadMessageId) {
        setLastReadMessageId(lastMessage.id)
        if (lastMessage.sender?.isAdmin) {
          setUnreadCount(0)
        }
      }
    }
  }, [isOpen, conversation?.messages, lastReadMessageId])

  const loadConversation = async () => {
    setLoading(true)
    try {
      const res = await chatAPI.getMyConversation()
      const conv = res.data.conversation
      setConversation(conv)

      if (conv?.messages?.length > 0) {
        const userMessages = conv.messages.filter((m) => m.senderId === user?.id)
        const lastUserMessage = userMessages[userMessages.length - 1]

        if (lastUserMessage) {
          const unread = conv.messages.filter(
            (m) =>
              m.sender?.isAdmin &&
              new Date(m.createdAt) > new Date(lastUserMessage.createdAt)
          )
          setUnreadCount(unread.length)
        } else {
          const adminMessages = conv.messages.filter((m) => m.sender?.isAdmin)
          setUnreadCount(adminMessages.length)
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
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
      setSending(false)
      return
    }

    try {
      const res = await chatAPI.sendMessage(text)
      setConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), res.data.message],
      }))
      toast.success('Message sent!')
    } catch (err) {
      toast.error('Failed to send message')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleToggle = () => {
    if (isChatPage) {
      navigate('/chat')
      return
    }
    setIsOpen(!isOpen)
    if (!isOpen && !conversation) {
      loadConversation()
    }
  }

  const handleOpenFullChat = () => {
    navigate('/chat')
    setIsOpen(false)
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!user || user.isAdmin) return null

  const messages = conversation?.messages || []

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all duration-300 ${
          unreadCount > 0
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-600 ring-4 ring-red-400/50'
            : 'bg-primary-600 hover:bg-primary-500 active:bg-primary-700'
        } text-white active:scale-95 hover:scale-105 transform ${unreadCount > 0 ? 'animate-pulse' : ''}`}
        aria-label="Open support chat"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center border-2 border-slate-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Chat widget modal - dark theme */}
      {isOpen && !isChatPage && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-6 z-50 w-auto sm:w-96 h-[calc(100vh-6rem)] sm:h-[600px] max-h-[600px] rounded-2xl shadow-2xl flex flex-col border border-slate-700 bg-slate-800 overflow-hidden">
            {/* Header - slate with primary accent */}
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-full bg-primary-500/20 border border-primary-500/40 flex-shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-50 truncate">Support Chat</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {connected ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Wifi className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <WifiOff className="h-3 w-3" /> Connecting...
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleOpenFullChat}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                  title="Open full chat"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages - dark area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-950/50 min-h-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 px-4">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs sm:text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 py-2 ${
                            isMe
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-md'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] font-medium text-primary-400 mb-0.5">
                              {msg.sender?.fullName || 'Support'}
                            </p>
                          )}
                          <p className="text-xs whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[9px] sm:text-[10px] mt-0.5 ${
                              isMe ? 'text-primary-200' : 'text-slate-500'
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

            {/* Input - slate footer */}
            <div className="p-3 border-t border-slate-700 bg-slate-800/80 flex-shrink-0">
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
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
