import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../app/hooks/useAuth'
import { useToast } from '../app/hooks/useToast'
import { useSocket, useSocketEvent } from '../app/hooks/useSocket'
import { chatService } from '../services/api'
import { Input, Spinner, Toast } from '../components/common'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const { toast, success, error: showError } = useToast()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typingUsers, setTypingUsers] = useState({})
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  const [mobileView, setMobileView] = useState('list')
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for incoming messages
  useSocketEvent('message:received', (msg) => {
    if (msg?.chatId && msg.chatId !== activeChatId) return
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev
      return [...prev, msg]
    })
  })

  // Listen for typing indicator
  useSocketEvent('user:typing', (data) => {
    if (data.chatId === activeChatId) {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.userName || 'User',
      }))
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      }, 3000)
    }
  })

  // Listen for message edited
  useSocketEvent('message:edited', (data) => {
    if (data?.chatId && data.chatId !== activeChatId) return
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId ? { ...msg, text: data.text } : msg
      )
    )
  })

  // Listen for message deleted
  useSocketEvent('message:deleted', (data) => {
    if (data?.chatId && data.chatId !== activeChatId) return
    setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId))
  })

  // Listen for message seen
  useSocketEvent('message:seen', (data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId ? { ...msg, seen: true } : msg
      )
    )
  })

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (activeChatId) {
      fetchMessages()
      // Emit that user joined this chat
      socket?.emit('chat:join', { chatId: activeChatId })
    }
  }, [activeChatId, socket])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatService.getChats()
      setChats(Array.isArray(data) ? data : data.chats || [])
      // Set first chat as active if not already set
      if (!activeChatId && (Array.isArray(data) ? data[0] : data.chats?.[0])) {
        setActiveChatId(
          (Array.isArray(data) ? data[0] : data.chats?.[0])?._id
        )
      }
    } catch (err) {
      showError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(activeChatId)
      setMessages(Array.isArray(data) ? data : data.messages || [])
    } catch (err) {
      showError('Failed to load messages')
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChatId) return

    setMessageText('')

    try {
      const sentMsg = await chatService.sendMessage(activeChatId, messageText)
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev
        return [...prev, sentMsg]
      })
      success('Message sent')
    } catch (err) {
      showError('Failed to send message')
    }
  }

  const handleTyping = () => {
    socket?.emit('user:typing', {
      chatId: activeChatId,
      userId: user._id,
      userName: user.name,
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('user:stopped-typing', {
        chatId: activeChatId,
        userId: user._id,
      })
    }, 1000)
  }

  const handleLogout = async () => {
    try {
      await logout()
      socket?.disconnect()
      success('Logged out')
    } catch {
      showError('Logout failed')
    }
  }

  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) return
    
    try {
      await chatService.editMessage(messageId, editingText)
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: editingText } : msg
        )
      )
      setEditingMessageId(null)
      setEditingText('')
      success('Message edited')
    } catch (err) {
      showError('Failed to edit message')
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      await chatService.deleteMessage(messageId)
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      success('Message deleted')
    } catch (err) {
      showError('Failed to delete message')
    }
  }

  const startEditMessage = (message) => {
    setEditingMessageId(message._id)
    setEditingText(message.text)
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditingText('')
  }

  const handleUserSearch = async (q) => {
    setUserSearch(q)
    if (!q.trim()) { setUserResults([]); return }
    setUserSearchLoading(true)
    try {
      const results = await chatService.searchUsers(q)
      setUserResults(results)
    } catch {
      showError('Failed to search users')
    } finally {
      setUserSearchLoading(false)
    }
  }

  const openChat = (id) => {
    setActiveChatId(id)
    if (isMobile) setMobileView('chat')
  }

  const startChat = async (userId) => {
    try {
      const chat = await chatService.createChat(userId)
      setChats((prev) => prev.some((c) => c._id === chat._id) ? prev : [chat, ...prev])
      openChat(chat._id)
      setShowNewChat(false)
      setUserSearch('')
      setUserResults([])
    } catch {
      showError('Failed to start chat')
    }
  }

  const typingList = Object.values(typingUsers).join(', ')

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--ds-bg, #f4f7fa)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? '100%' : 280,
          minWidth: isMobile ? 'unset' : 280,
          background: 'white',
          borderRight: '1px solid var(--ds-muted, #edf2f5)',
          padding: 16,
          overflowY: 'auto',
          display: isMobile && mobileView === 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img src={user?.avatar || 'https://i.pravatar.cc/150?img=12'} alt={user?.name} style={{ width: 48, height: 48, borderRadius: '9999px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ds-text, #24303a)' }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', marginTop: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isConnected ? '#2ec8a8' : '#ccc',
                }}
              />
              {isConnected ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ds-accent, #2ec8a8)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: 0,
                marginTop: 4,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <Input
          type="text"
          placeholder="Search chats"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ds-subtext, #7b8790)', textTransform: 'uppercase', margin: 0 }}>
              Chats
            </h3>
            <button
              onClick={() => { setShowNewChat((v) => !v); setUserSearch(''); setUserResults([]) }}
              title="New chat"
              style={{ background: 'var(--ds-accent, #2ec8a8)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: 'white', fontSize: 16, cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >+</button>
          </div>

          {showNewChat && (
            <div style={{ marginBottom: 12 }}>
              <input
                autoFocus
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--ds-muted, #edf2f5)', fontSize: 13, boxSizing: 'border-box' }}
              />
              {userSearchLoading && <div style={{ fontSize: 12, color: 'var(--ds-subtext, #7b8790)', marginTop: 4 }}>Searching…</div>}
              {userResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => startChat(u._id)}
                  style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--ds-text, #24303a)', marginTop: 4, background: 'var(--ds-muted, #edf2f5)' }}
                >
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ds-subtext, #7b8790)' }}>{u.email}</div>
                </div>
              ))}
              {userSearch.trim() && !userSearchLoading && userResults.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--ds-subtext, #7b8790)', marginTop: 4 }}>No users found</div>
              )}
            </div>
          )}
          {loading ? (
            <Spinner />
          ) : chats.length === 0 ? (
            <div style={{ color: 'var(--ds-subtext, #7b8790)', fontSize: '14px' }}>
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => openChat(chat._id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: activeChatId === chat._id ? 'var(--ds-muted, #edf2f5)' : 'transparent',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ds-text, #24303a)' }}>
                  {chat.name || (chat.participants
                    ? chat.participants.filter(p => p._id !== user?._id).map(p => p.name).join(', ') || 'Chat'
                    : 'Chat')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ds-subtext, #7b8790)', marginTop: 2 }}>
                  {chat.lastMessage?.text || (typeof chat.lastMessage === 'string' ? chat.lastMessage : 'No messages')}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat */}
      <main style={{ flex: 1, display: isMobile && mobileView === 'list' ? 'none' : 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: 16,
                borderBottom: '1px solid var(--ds-muted, #edf2f5)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {isMobile && (
                <button
                  onClick={() => setMobileView('list')}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ds-accent, #2ec8a8)', padding: 0, lineHeight: 1 }}
                >←</button>
              )}
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--ds-text, #24303a)' }}>
                {chats.find(c => c._id === activeChatId)?.participants?.filter(p => p._id !== user?._id).map(p => p.name).join(', ') || 'Chat'}
              </h2>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--ds-subtext, #7b8790)' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      style={{
                        maxWidth: '60%',
                        alignSelf: msg.sender === user?._id ? 'flex-end' : 'flex-start',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: msg.sender === user?._id ? '#e8f9f2' : 'white',
                        color: 'var(--ds-text, #24303a)',
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        marginLeft: msg.sender === user?._id ? 'auto' : 0,
                        position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--ds-subtext, #7b8790)', marginBottom: 4 }}>
                        {msg.senderName || 'User'}
                      </div>
                      
                      {editingMessageId === msg._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleEditMessage(msg._id)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid var(--ds-muted, #edf2f5)',
                              fontSize: '14px',
                            }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleEditMessage(msg._id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--ds-accent, #2ec8a8)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--ds-muted, #edf2f5)',
                                background: 'white',
                                color: 'var(--ds-text, #24303a)',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {msg.text}
                          {msg.sender === user?._id && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: 4,
                            }}>
                              <div style={{ fontSize: '10px', color: 'var(--ds-subtext, #7b8790)' }}>
                                {msg.seen ? '✓✓' : '✓'}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => startEditMessage(msg)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--ds-subtext, #7b8790)',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    padding: 0,
                                  }}
                                  title="Edit message"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--ds-danger, #ff6b6b)',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    padding: 0,
                                  }}
                                  title="Delete message"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {typingList && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ds-accent, #2ec8a8)',
                    fontStyle: 'italic',
                    marginTop: 4,
                  }}
                >
                  {typingList} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div
              style={{
                padding: 16,
                borderTop: '1px solid var(--ds-muted, #edf2f5)',
                background: 'white',
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                type="text"
                placeholder="Write your message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ds-muted, #edf2f5)',
                  fontSize: '14px',
                }}
              />
              <button onClick={sendMessage} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(180deg, var(--ds-accent), var(--ds-accent-600))', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Send</button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-subtext, #7b8790)',
            }}
          >
            Select a chat to start messaging
          </div>
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
