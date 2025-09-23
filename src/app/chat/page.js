// src/app/chat/page.js - Complete file with ESLint fixes
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { io } from 'socket.io-client'

// Enhanced UserList with single online indicator - FIXED
const UserList = ({ onlineUsers, currentUser }) => {
  // Filter out current user from the online users list to prevent duplicates
  const otherUsers = onlineUsers.filter(user => user.username !== currentUser?.username)
  
  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chat Room
          </h2>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 10v6m11-7h-6M7 12H1"/>
          </svg>
          <span>{onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online</span>
        </div>
      </div>

      {/* Other Online Users - Scrollable Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-h-0">
        <div className="p-4">
          {otherUsers.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Others Online — {otherUsers.length}
              </div>
              <div className="space-y-2">
                {otherUsers.map((user, index) => (
                  <div
                    key={user.id || user.username || index}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50"
                  >
                    {/* Avatar without small green dot */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    
                    {/* User info with single online indicator below name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {user.username}
                      </p>
                      {/* Single green circle with Online text */}
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <p className="text-sm text-green-400">Online</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Show message when only current user is online - FIXED APOSTROPHE */}
          {otherUsers.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <p className="text-sm">{`You're the only one online`}</p>
              <p className="text-xs mt-1 opacity-75">Waiting for others to join...</p>
            </div>
          )}
        </div>
      </div>

      {/* Current User Card - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          You
        </div>
        <div className="flex items-center space-x-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
          {/* Avatar without small green dot */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          {/* User info with single online indicator below name */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-blue-300 truncate">{currentUser?.username || 'Unknown'}</p>
            {/* Single green circle with Online text */}
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <p className="text-sm text-green-400">Online</p>
            </div>
          </div>
          
          <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced MessageList with modern chat bubbles
const MessageList = ({ messages, currentUser, typingUsers }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the conversation! 🎉</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              This is the beginning of your chat history. Send a message to start the conversation and connect with everyone!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Date header */}
          {messages.length > 0 && (
            <div className="flex justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-semibold text-gray-600">
                  {formatDate(messages[0]?.createdAt)}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const isOwnMessage = message.senderUsername === currentUser?.username
            const showAvatar = index === 0 || messages[index - 1]?.senderUsername !== message.senderUsername
            
            return (
              <div key={message.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <div className="flex-shrink-0 mb-1">
                      {showAvatar ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {message.senderUsername?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      ) : (
                        <div className="w-10 h-10"></div>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {/* Username */}
                    {!isOwnMessage && showAvatar && (
                      <div className="mb-1 px-1">
                        <span className="text-sm font-semibold text-gray-600">{message.senderUsername}</span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`relative px-6 py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl max-w-full break-words ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Time */}
                      <div className={`text-xs mt-2 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                      </div>

                      {/* Message tail */}
                      <div className={`absolute bottom-0 ${
                        isOwnMessage 
                          ? '-right-2 border-l-8 border-l-blue-600 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
                          : '-left-2 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
                      } w-0 h-0`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                  {typingUsers[0]?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} is typing` 
                        : `${typingUsers.length} people are typing`
                      }
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Enhanced MessageInput with modern design
const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      if (isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      onTyping(true)
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false)
      onTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end space-x-4">
          {/* Emoji button */}
          <button
            type="button"
            className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 9c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5S14.67 9 15.5 9zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm leading-relaxed"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            
            {/* Attach file button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

// Main Chat Component - REST REMAINS SAME
export default function ChatPage() {
  const [socket, setSocket] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()

  // Initialize user and socket
  useEffect(() => {
    const initializeChat = async () => {
      const token = Cookies.get('token')
      const userData = Cookies.get('user')

      if (!token || !userData) {
        setShouldRedirect(true)
        return
      }

      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)

        const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', {
          auth: { token: token }
        })

        setSocket(socketInstance)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing chat:', error)
        Cookies.remove('token')
        Cookies.remove('user')
        setShouldRedirect(true)
      }
    }

    initializeChat()
  }, [])

  // Handle redirect
  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/login')
    }
  }, [shouldRedirect, router])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)
    const handleConnectionError = (error) => {
      if (error.message === 'Authentication error') {
        Cookies.remove('token')
        Cookies.remove('user')
        setShouldRedirect(true)
      }
    }
    const handleRecentMessages = (messages) => setMessages(messages)
    const handleNewMessage = (message) => setMessages(prev => [...prev, message])
    const handleOnlineUsers = (users) => setOnlineUsers(users)
    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username]
        }
        return prev
      })
    }
    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(user => user !== data.username))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectionError)
    socket.on('recentMessages', handleRecentMessages)
    socket.on('message', handleNewMessage)
    socket.on('onlineUsers', handleOnlineUsers)
    socket.on('typing', handleUserTyping)
    socket.on('stopTyping', handleUserStoppedTyping)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectionError)
      socket.off('recentMessages', handleRecentMessages)
      socket.off('message', handleNewMessage)
      socket.off('onlineUsers', handleOnlineUsers)
      socket.off('typing', handleUserTyping)
      socket.off('stopTyping', handleUserStoppedTyping)
    }
  }, [socket])

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  const handleSendMessage = useCallback((content) => {
    if (socket && content.trim()) {
      socket.emit('sendMessage', { content: content.trim() })
    }
  }, [socket])

  const handleTyping = useCallback((isTyping) => {
    if (socket) {
      if (isTyping) {
        socket.emit('typing')
      } else {
        socket.emit('stopTyping')
      }
    }
  }, [socket])

  const handleLogout = () => {
    if (socket) {
      socket.disconnect()
    }
    Cookies.remove('token')
    Cookies.remove('user')
    router.replace('/login')
  }

  if (shouldRedirect || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mx-auto mb-6 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {shouldRedirect ? 'Redirecting...' : 'Connecting to chat...'}
          </h2>
          <p className="text-gray-500">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <UserList onlineUsers={onlineUsers} currentUser={currentUser} />
      <div className="flex-1 flex flex-col bg-white shadow-xl">
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">General Chat</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    <span>•</span>
                    <span>{onlineUsers.length} online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Welcome back!</p>
                <p className="text-xs text-gray-500">{currentUser?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <MessageList messages={messages} currentUser={currentUser} typingUsers={typingUsers} />
        <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
      </div>
    </div>
  )
}



