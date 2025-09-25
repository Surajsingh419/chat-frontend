'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { io } from 'socket.io-client'

// Emoji picker component
const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤐', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
    '👍', '👎', '👌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
    '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌',
    '👐', '🤲', '🤜', '🤛', '✊', '👊', '🤳', '💪', '🦵', '🦶',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
  ]

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 sm:w-72 h-40 sm:h-48 overflow-y-auto">
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded transition-colors text-base sm:text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// File preview component
const FilePreview = ({ fileData, onRemove }) => {
  const isImage = fileData?.type?.startsWith('image') || fileData?.mimetype?.startsWith('image')

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3">
      <div className="flex-shrink-0">
        {isImage ? (
          <img 
            src={URL.createObjectURL(fileData)} 
            alt="Preview" 
            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded flex items-center justify-center text-white text-sm">
            📄
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{fileData?.name || 'Unknown file'}</p>
        <p className="text-xs text-gray-500">{((fileData?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <button 
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600 p-1"
      >
        ✕
      </button>
    </div>
  )
}

// Helper function to format last seen time
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Never'
  
  const now = new Date()
  const lastSeenDate = new Date(lastSeen)
  const diffInSeconds = Math.floor((now - lastSeenDate) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return lastSeenDate.toLocaleDateString()
}

// UserList component
const UserList = ({ allUsers, currentUser, onUserSelect, activeChat, unreadCounts, isOpen, onClose }) => {
  // Filter and separate users with proper null checks
  const currentUsername = currentUser?.username
  const otherUsers = (allUsers || []).filter(user => user?.username && user.username !== currentUsername)
  const onlineUsers = otherUsers.filter(user => user?.isOnline)
  const offlineUsers = otherUsers.filter(user => !user?.isOnline)

  const UserCard = ({ user, isOffline = false }) => {
    if (!user) return null
    
    const isActive = activeChat?.id === user?.id
    const hasUnread = (unreadCounts || {})[user?.id] > 0

    return (
      <div
        onClick={() => {
          onUserSelect(user)
          onClose() // Close sidebar on mobile
        }}
        className={`relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
          isActive 
            ? 'bg-gradient-to-r from-purple-500/20 via-purple-600/20 to-pink-500/20 border-l-4 border-purple-500 shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-800/30'
        } ${isOffline ? 'opacity-75 hover:opacity-100' : ''}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg">
          {/* Avatar with status indicator */}
          <div className="flex-shrink-0 relative">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 ring-2 ring-purple-300'
                : isOffline 
                  ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700' 
                  : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
            }`}>
              {(user?.username?.charAt(0) || 'U').toUpperCase()}
            </div>
            
            {/* Status indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 shadow-lg ${
              user?.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            
            {/* Unread badge */}
            {hasUnread && (
              <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                {(unreadCounts || {})[user?.id] > 99 ? '99+' : (unreadCounts || {})[user?.id]}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold truncate text-sm sm:text-base transition-colors ${
                isActive ? 'text-purple-300' : 'text-white'
              }`}>
                {user?.username || 'Unknown User'}
              </h3>
              
              {/* Online/Offline badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.isOnline 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {user?.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Last seen */}
            <p className="text-xs text-gray-400 mt-1">
              {user?.isOnline ? 'Active now' : `Last seen ${formatLastSeen(user?.lastSeen)}`}
            </p>
          </div>

          {/* Active chat indicator */}
          {isActive && (
            <div className="flex-shrink-0">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 w-80 sm:w-96 lg:w-80 xl:w-96 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl h-full transform transition-transform duration-300 ease-in-out lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Messages
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Private conversations
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">{onlineUsers?.length || 0}</span>
              </div>
              
              {/* Close button for mobile */}
              <button 
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">{onlineUsers?.length || 0} online</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300">{offlineUsers?.length || 0} offline</span>
              </div>
            </div>
            
            {Object.keys(unreadCounts || {}).length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium">
                  {Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0)} unread
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User List - Scrollable */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
            <div className="p-3 sm:p-4 space-y-6">

              {/* Online Users Section */}
              {onlineUsers?.length > 0 && (
                <div className="space-y-2">
                  <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 z-10 py-2 -mx-1 px-1">
                    <div className="flex items-center space-x-2 text-xs font-bold text-green-400 uppercase tracking-wider">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online ({onlineUsers?.length || 0})</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-green-400/50 to-transparent"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {onlineUsers.map((user, index) => (
                      <UserCard key={user?.id || user?.username + index || index} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Users Section */}
              {offlineUsers?.length > 0 && (
                <div className="space-y-2">
                  <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 z-10 py-2 -mx-1 px-1">
                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Offline ({offlineUsers?.length || 0})</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-400/50 to-transparent"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {offlineUsers.map((user, index) => (
                      <UserCard key={user?.id || user?.username + index || index} user={user} isOffline={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Users Available */}
              {(onlineUsers?.length || 0) === 0 && (offlineUsers?.length || 0) === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-3">No users found</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                    Waiting for other users to join the chat...
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Current User Card */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
            You
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-600/20 via-purple-700/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 relative shadow-lg">
              {(currentUser?.username?.charAt(0) || 'U').toUpperCase()}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-purple-300 truncate text-sm sm:text-base">
                {currentUser?.username || 'Unknown'}
              </h3>
              <p className="text-xs sm:text-sm text-green-400">Online</p>
            </div>

            <div className="text-gray-400 hover:text-white cursor-pointer transition-colors p-2 hover:bg-gray-700/30 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// MessageList component
const MessageList = ({ messages, currentUser, typingUsers, activeChat, onMenuOpen }) => {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString()
  }

  const renderFileMessage = (message) => {
    const fileData = message?.fileData
    if (!fileData) return null

    const isImage = fileData?.mimetype?.startsWith('image')
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
    const fileUrl = `${serverUrl}${fileData?.url}`

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="max-w-[200px] sm:max-w-xs">
            <img 
              src={fileUrl} 
              alt={fileData?.originalName || 'Image'}
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow w-full"
              onClick={() => window.open(fileUrl, '_blank')}
            />
            <p className="text-xs mt-1 opacity-75">{fileData?.originalName || 'Image'}</p>
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3 bg-white/10 rounded-lg p-2 sm:p-3 max-w-[250px] sm:max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                📄
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{fileData?.originalName || 'Unknown file'}</p>
              <p className="text-xs opacity-75">{((fileData?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={() => window.open(fileUrl, '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              📁
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm flex-shrink-0">
        {activeChat ? (
          <div className="flex items-center space-x-3">
            <button 
              onClick={onMenuOpen}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg relative text-sm sm:text-base">
              {(activeChat?.username?.charAt(0) || 'U').toUpperCase()}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                activeChat?.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{activeChat?.username || 'Unknown User'}</h1>
              <p className={`text-xs sm:text-sm ${activeChat?.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                {activeChat?.isOnline ? 'Online' : `Last seen ${formatLastSeen(activeChat?.lastSeen)}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button 
              onClick={onMenuOpen}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Select a chat</h1>
              <p className="text-xs sm:text-sm text-gray-500">Choose someone to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white min-h-0 max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
        style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}
      >
        {!activeChat ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
                <div className="text-4xl sm:text-6xl">👋</div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Welcome to Chat!
              </h3>
              <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
                Select someone from the sidebar to start a conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
            {/* Date header */}
            {(messages || []).length > 0 && (
              <div className="flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-2 rounded-full shadow-sm border border-gray-200">
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">
                    {formatDate(messages[0]?.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            {(messages || []).map((message, index) => {
              const isOwnMessage = message?.senderId === currentUser?.id || 
                                 message?.senderUsername === currentUser?.username || 
                                 message?.sender?.id === currentUser?.id
              const showAvatar = index === 0 || (messages || [])[index - 1]?.senderId !== message?.senderId || 
                               (messages || [])[index - 1]?.senderUsername !== message?.senderUsername

              return (
                <div key={message?.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 sm:space-x-3`}>

                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="flex-shrink-0 mb-1">
                        {showAvatar ? (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
                            {((message?.senderUsername || message?.sender?.username) || 'U').charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
                        )}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <div className={`relative px-3 sm:px-6 py-2 sm:py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl max-w-full min-w-0 ${
                        isOwnMessage 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-md' 
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      }`}>

                        {/* Text content */}
                        {message?.content && (
                          <p className="text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2 break-words overflow-wrap-anywhere" 
                             style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </p>
                        )}

                        {/* File content */}
                        {message?.messageType === 'file' && renderFileMessage(message)}

                        {/* Time */}
                        <div className={`text-xs mt-1 sm:mt-2 ${isOwnMessage ? 'text-purple-100' : 'text-gray-500'}`}>
                          {formatTime(message?.createdAt)}
                        </div>
                      </div>

                      {/* Message tail */}
                      <div className={`absolute bottom-0 ${
                        isOwnMessage 
                          ? '-right-2 border-l-8 border-l-purple-600 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
                          : '-left-2 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
                      } w-0 h-0`}></div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {(typingUsers || []).length > 0 && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {((typingUsers || [])[0] || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-600">{activeChat?.username || 'Someone'} is typing</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

// MessageInput component
const MessageInput = ({ onSendMessage, onTyping, activeChat }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeChat) return

    if (selectedFile) {
      await handleFileUpload()
    } else if (message.trim()) {
      onSendMessage({
        content: message.trim(),
        targetUserId: activeChat?.id
      })
      setMessage('')
    }

    if (isTyping) {
      setIsTyping(false)
      onTyping(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !activeChat) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const fileData = await response.json()
        onSendMessage({
          content: message.trim() || '',
          messageType: fileData?.mimetype?.startsWith('image') ? 'image' : 'file',
          fileData: fileData,
          targetUserId: activeChat?.id
        })
        setSelectedFile(null)
        setMessage('')
      } else {
        console.error('File upload failed')
      }
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }

    if (!activeChat) return

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

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!activeChat) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-base sm:text-lg font-medium">Select a user to start messaging</p>
          <p className="text-sm text-gray-400 mt-1">Choose someone from the sidebar to begin your conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white flex-shrink-0 shadow-lg">
      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 sm:px-6 pt-4">
          <FilePreview fileData={selectedFile} onRemove={removeFile} />
        </div>
      )}

      {/* Input Container */}
      <div className="px-4 sm:px-6 py-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-200 hover:border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">

            {/* Left Actions Container */}
            <div className="flex items-center gap-1">
              {/* File Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.mp3,.zip"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                  title="Attach file"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    showEmojiPicker 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  title="Add emoji"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 9c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5S14.67 9 15.5 9zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                  </svg>
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowEmojiPicker(false)}
                    />
                    <div className="absolute bottom-14 left-0 z-50">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Message Input Container */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeChat?.username || 'user'}...`}
                rows={1}
                className="w-full px-4 py-3 bg-transparent border-none resize-none focus:outline-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isUploading}
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center">
              <button
                type="submit"
                disabled={(!message.trim() && !selectedFile) || isUploading}
                className="group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                title="Send message"
              >
                {isUploading ? (
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Typing Indicator */}
        {isTyping && activeChat && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <div className="text-xs text-gray-500">
              Typing to {activeChat?.username || 'user'}...
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Chat Component
export default function ChatPage() {
  const [socket, setSocket] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          auth: { token: token },
          transports: ['websocket', 'polling'],
          autoConnect: true
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
    if (!socket || !currentUser) return

    const handleConnect = () => {
      console.log('✅ Connected to server')
      setIsConnected(true)
      // Request all users when connected
      socket.emit('getAllUsers')
    }

    const handleDisconnect = () => {
      console.log('❌ Disconnected from server')
      setIsConnected(false)
    }

    const handleConnectionError = (error) => {
      console.error('Connection error:', error)
      if (error?.message === 'Authentication error') {
        Cookies.remove('token')
        Cookies.remove('user')
        setShouldRedirect(true)
      }
    }

    const handleRecentMessages = (data) => {
      console.log('📝 Received recent messages:', data)
      if (data?.isPrivate && data?.targetUserId) {
        setMessages(data?.messages || [])
      }
    }

    const handleNewMessage = (message) => {
      console.log('📨 New private message received:', message)

      const senderId = message?.senderId || message?.sender?.id
      const receiverId = message?.receiverId || message?.receiver?.id
      const senderUsername = message?.senderUsername || message?.sender?.username

      const isForCurrentChat = activeChat && (
        (senderId === activeChat?.id && receiverId === currentUser?.id) ||
        (senderId === currentUser?.id && receiverId === activeChat?.id)
      )

      if (isForCurrentChat) {
        console.log('Message is for current active chat, adding to messages')
        setMessages(prev => [...(prev || []), message])
      } else if (senderUsername !== currentUser?.username && senderId && senderId !== currentUser?.id) {
        console.log('Message is for different chat, updating unread count for senderId:', senderId)
        setUnreadCounts(prev => ({
          ...(prev || {}),
          [senderId]: ((prev || {})[senderId] || 0) + 1
        }))
      }
    }

    const handleAllUsers = (users) => {
      console.log('👥 All users updated:', users)
      setAllUsers(users || [])
      
      // Update activeChat with new online status if it exists
      if (activeChat && users) {
        const updatedActiveChat = users.find(user => user?.id === activeChat?.id)
        if (updatedActiveChat) {
          setActiveChat(updatedActiveChat)
        }
      }
    }

    const handleUserTyping = (data) => {
      console.log('⌨️ User typing:', data)
      if (activeChat && data?.userId === activeChat?.id) {
        setTypingUsers(prev => {
          const prevArray = prev || []
          if (!prevArray.includes(data?.username)) {
            return [...prevArray, data?.username]
          }
          return prevArray
        })
      }
    }

    const handleUserStoppedTyping = (data) => {
      console.log('⏹️ User stopped typing:', data)
      setTypingUsers(prev => (prev || []).filter(user => user !== data?.username))
    }

    // Register event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectionError)
    socket.on('recentMessages', handleRecentMessages)
    socket.on('message', handleNewMessage)
    socket.on('allUsers', handleAllUsers)
    socket.on('typing', handleUserTyping)
    socket.on('stopTyping', handleUserStoppedTyping)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectionError)
      socket.off('recentMessages', handleRecentMessages)
      socket.off('message', handleNewMessage)
      socket.off('allUsers', handleAllUsers)
      socket.off('typing', handleUserTyping)
      socket.off('stopTyping', handleUserStoppedTyping)
    }
  }, [socket, activeChat, currentUser])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('🧹 Cleaning up socket connection')
        socket.disconnect()
      }
    }
  }, [socket])

  // Handle user selection and chat switching
  const handleUserSelect = useCallback((user) => {
    console.log('👤 User selected:', user)

    // Clear unread count for this user
    setUnreadCounts(prev => {
      const newCounts = { ...(prev || {}) }
      if (user?.id) {
        delete newCounts[user.id]
      }
      return newCounts
    })

    if (socket && user?.id) {
      socket.emit('joinPrivateChat', { targetUserId: user.id })
    }

    setActiveChat(user)
    setMessages([])
    setTypingUsers([])
  }, [socket])

  const handleSendMessage = useCallback((messageData) => {
    if (socket && activeChat) {
      console.log('📤 Sending private message:', messageData)
      socket.emit('sendMessage', {
        ...messageData,
        isPrivate: true
      })
    }
  }, [socket, activeChat])

  const handleTyping = useCallback((isTyping) => {
    if (socket && activeChat) {
      console.log('⌨️ Typing status:', isTyping)
      const typingData = {
        isPrivate: true,
        targetUserId: activeChat?.id
      }

      if (isTyping) {
        socket.emit('typing', typingData)
      } else {
        socket.emit('stopTyping', typingData)
      }
    }
  }, [socket, activeChat])

  const handleLogout = () => {
    console.log('🚪 Logging out...')
    if (socket) {
      socket.disconnect()
    }
    Cookies.remove('token')
    Cookies.remove('user')
    router.replace('/login')
  }

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  if (shouldRedirect || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            {shouldRedirect ? 'Redirecting...' : 'Connecting to chat...'}
          </h2>
          <p className="text-sm sm:text-base text-gray-500">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    )
  }

  const currentUsername = currentUser?.username
  const onlineUsersCount = (allUsers || []).filter(user => user?.isOnline && user?.username !== currentUsername).length
  const offlineUsersCount = (allUsers || []).filter(user => !user?.isOnline && user?.username !== currentUsername).length

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* UserList */}
      <UserList 
        allUsers={allUsers}
        currentUser={currentUser}
        onUserSelect={handleUserSelect}
        activeChat={activeChat}
        unreadCounts={unreadCounts}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      <div className="flex-1 flex flex-col bg-white shadow-xl min-w-0">
        {/* Connection Status Bar */}
        <div className={`px-3 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm text-center transition-all flex-shrink-0 ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="truncate">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {activeChat && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline truncate">Private chat with {activeChat?.username}</span>
              </>
            )}
          </div>
        </div>

        <MessageList 
          messages={messages}
          currentUser={currentUser}
          typingUsers={typingUsers}
          activeChat={activeChat}
          onMenuOpen={handleSidebarToggle}
        />

        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          activeChat={activeChat}
        />

        {/* User Info & Logout Bar */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
              {(currentUser?.username?.charAt(0) || 'U').toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                <span className="hidden sm:inline">Logged in as </span>
                <span className="text-purple-600">{currentUser?.username || 'Unknown'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
              <span>{onlineUsersCount} online</span>
              <span className="hidden sm:inline">• {offlineUsersCount} offline</span>
              {activeChat && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline truncate">With {activeChat?.username}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
