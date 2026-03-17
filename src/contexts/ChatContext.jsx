import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'https://motoinvestment2.space/api'
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:5000'

const ChatContext = createContext()

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

export function ChatProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const s = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', () => setConnected(false))

    setSocket(s)
    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [])

  const sendMessage = useCallback(
    (content, conversationId = null) => {
      if (!socket?.connected) return false
      socket.emit('chat:send', { content, conversationId })
      return true
    },
    [socket]
  )

  const value = {
    socket,
    connected,
    sendMessage,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
