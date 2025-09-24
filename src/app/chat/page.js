// src/app/chat/page.js - FIXED Responsive Private Chat
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
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
    '🔥', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️',
    '🗨️', '🗯️', '💭', '💤'
  ]

  return (
    <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 sm:w-72 h-40 sm:h-48 overflow-y-auto z-50">
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
  const isImage = fileData.mimetype?.startsWith('image/')
  
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
        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{fileData.name}</p>
        <p className="text-xs text-gray-500">{(fileData.size / 1024 / 1024).toFixed(2)} MB</p>
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

// UserList for private chats only - Now responsive
const UserList = ({ onlineUsers, currentUser, onUserSelect, activeChat, unreadCounts, isOpen, onClose }) => {
  const otherUsers = onlineUsers.filter(user => user.username !== currentUser?.username)
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 w-80 sm:w-96 lg:w-80 xl:w-96 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl h-full transform transition-transform duration-300 ease-in-out lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chats
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              {/* Close button for mobile */}
              <button 
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-gray-700 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 10v6m11-7h-6M7 12H1"/>
            </svg>
            <span className="text-xs sm:text-sm">{onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online</span>
            {Object.keys(unreadCounts).length > 0 && (
              <>
                <span>•</span>
                <span className="text-red-400 text-xs sm:text-sm">{Object.values(unreadCounts).reduce((a, b) => a + b, 0)} unread</span>
              </>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-h-0">
          <div className="p-3 sm:p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Available Users — {otherUsers.length}
            </div>
            {otherUsers.length > 0 ? (
              <div className="space-y-2">
                {otherUsers.map((user, index) => (
                  <div
                    key={user.id || user.username || index}
                    onClick={() => {
                      onUserSelect(user)
                      onClose() // Close sidebar on mobile after selection
                    }}
                    className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer relative ${
                      activeChat?.id === user.id
                        ? 'bg-purple-600/30 border border-purple-500/50'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm sm:text-base">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm sm:text-base">
                        {user.username}
                      </p>
                      <p className="text-xs sm:text-sm text-green-400">Online</p>
                    </div>

                    {unreadCounts[user.id] && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold">
                        {unreadCounts[user.id]}
                      </div>
                    )}

                    <div className="text-purple-400 text-sm sm:text-base">
                      💬
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-6 sm:py-8">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-base sm:text-lg font-medium mb-2">No users available</p>
                <p className="text-xs sm:text-sm opacity-75">Waiting for others to come online...</p>
              </div>
            )}
          </div>
        </div>

        {/* Current User Card */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            You
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 relative text-sm sm:text-base">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-purple-300 truncate text-sm sm:text-base">{currentUser?.username || 'Unknown'}</p>
              <p className="text-xs sm:text-sm text-green-400">Online</p>
            </div>
            
            <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// MessageList for private chats - Now responsive
const MessageList = ({ messages, currentUser, typingUsers, activeChat, onMenuOpen }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const renderFileMessage = (message) => {
    const { fileData } = message
    if (!fileData) return null

    const isImage = fileData.mimetype?.startsWith('image/')
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
    const fileUrl = `${serverUrl}${fileData.url}`

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="max-w-[200px] sm:max-w-xs">
            <img 
              src={fileUrl} 
              alt={fileData.originalName}
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow w-full"
              onClick={() => window.open(fileUrl, '_blank')}
            />
            <p className="text-xs mt-1 opacity-75">{fileData.originalName}</p>
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3 bg-white/10 rounded-lg p-2 sm:p-3 max-w-[250px] sm:max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                📄
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{fileData.originalName}</p>
              <p className="text-xs opacity-75">{(fileData.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              ⬇️
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header - Now responsive */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        {activeChat ? (
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuOpen}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg relative text-sm sm:text-base">
              {activeChat.username?.charAt(0).toUpperCase() || 'U'}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{activeChat.username}</h1>
              <p className="text-xs sm:text-sm text-green-500">Online</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
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
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Select a chat</h1>
              <p className="text-xs sm:text-sm text-gray-500">Choose someone to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area - Now responsive */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {!activeChat ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
                <div className="text-4xl sm:text-6xl">💬</div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Welcome to Private Chat
              </h3>
              <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
                Select someone from the sidebar to start a private conversation. All your messages are secure and only visible between you two.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
                <div className="text-4xl sm:text-6xl">🚀</div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Start chatting with {activeChat.username}!
              </h3>
              <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
                This is the beginning of your private conversation. Send a message to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Date header */}
            {messages.length > 0 && (
              <div className="flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-2 rounded-full shadow-sm border border-gray-200">
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">
                    {formatDate(messages[0]?.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => {
              // **FIXED:** Simplified message ownership checking
              const isOwnMessage = message.senderId === currentUser?.id || 
                                 message.senderUsername === currentUser?.username ||
                                 message.sender?.id === currentUser?.id ||
                                 message.sender?._id === currentUser?.id

              const showAvatar = index === 0 || 
                               (messages[index - 1]?.senderId !== message.senderId &&
                                messages[index - 1]?.senderUsername !== message.senderUsername)
              
              return (
                <div key={message.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 sm:space-x-3`}>
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="flex-shrink-0 mb-1">
                        {showAvatar ? (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
                            {(message.senderUsername || message.sender?.username || 'U')?.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
                        )}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <div className={`relative px-3 sm:px-6 py-2 sm:py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl max-w-full break-words ${
                        isOwnMessage
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      }`}>
                        {/* Text content */}
                        {message.content && (
                          <p className="text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">{message.content}</p>
                        )}
                        
                        {/* File content */}
                        {message.messageType === 'file' && renderFileMessage(message)}
                        
                        {/* Time */}
                        <div className={`text-xs mt-1 sm:mt-2 ${isOwnMessage ? 'text-purple-100' : 'text-gray-500'}`}>
                          {formatTime(message.createdAt)}
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
                </div>
              )
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {typingUsers[0]?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-600">
                        {activeChat?.username} is typing
                      </span>
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

// MessageInput for private chats - Now responsive
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
        targetUserId: activeChat.id
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
          messageType: fileData.mimetype.startsWith('image/') ? 'image' : 'file',
          fileData: fileData,
          targetUserId: activeChat.id
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
      <div className="border-t border-gray-200 bg-gray-50 px-3 sm:px-6 py-6 sm:py-8">
        <div className="text-center text-gray-500">
          <p className="text-base sm:text-lg">Select a user to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* File Preview */}
      {selectedFile && (
        <div className="px-3 sm:px-6 pt-3 sm:pt-4">
          <FilePreview fileData={selectedFile} onRemove={removeFile} />
        </div>
      )}
      
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end space-x-2 sm:space-x-4">
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
                className="flex-shrink-0 p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Attach file"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>

            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex-shrink-0 p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Add emoji"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 9c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5S14.67 9 15.5 9zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                </svg>
              </button>
              
              {showEmojiPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowEmojiPicker(false)}
                  ></div>
                  <EmojiPicker 
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </>
              )}
            </div>

            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeChat.username}...`}
                rows={1}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-2xl sm:rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-sm leading-relaxed"
                style={{
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
                disabled={isUploading}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={(!message.trim() && !selectedFile) || isUploading}
              className="flex-shrink-0 p-2 sm:p-3 rounded-full focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              {isUploading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Chat Component - Now fully responsive with FIXED message handling
export default function ChatPage() {
  const [socket, setSocket] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
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
    }

    const handleDisconnect = () => {
      console.log('🔌 Disconnected from server')
      setIsConnected(false)
    }

    const handleConnectionError = (error) => {
      console.error('❌ Connection error:', error)
      if (error.message === 'Authentication error') {
        Cookies.remove('token')
        Cookies.remove('user')
        setShouldRedirect(true)
      }
    }

    const handleRecentMessages = (data) => {
      console.log('📩 Received recent messages:', data)
      if (data.isPrivate && data.targetUserId) {
        setMessages(data.messages || [])
      }
    }

    // **FIXED:** Simplified message handling logic
    const handleNewMessage = (message) => {
      console.log('📨 New private message received:', message)
      
      const senderId = message.senderId || message.sender?.id || message.sender?._id
      const receiverId = message.receiverId || message.receiver?.id || message.receiver?._id
      const senderUsername = message.senderUsername || message.sender?.username
      
      console.log('Message details:', { senderId, receiverId, senderUsername, currentUserId: currentUser?.id, activeChatId: activeChat?.id })
      
      // Check if this message belongs to current active chat
      const isForCurrentChat = activeChat && (
        (senderId === activeChat.id && receiverId === currentUser?.id) ||
        (senderId === currentUser?.id && receiverId === activeChat.id)
      )
      
      if (isForCurrentChat) {
        console.log('✅ Message is for current active chat, adding to messages')
        setMessages(prev => [...prev, message])
      } else if (senderUsername !== currentUser?.username && senderId && senderId !== currentUser?.id) {
        console.log('📬 Message is for different chat, updating unread count for senderId:', senderId)
        // Update unread count for messages from other users
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }))
      }
    }

    const handleOnlineUsers = (users) => {
      console.log('👥 Online users updated:', users)
      setOnlineUsers(users)
    }

    const handleUserTyping = (data) => {
      console.log('⌨️ User typing:', data)
      if (activeChat && data.userId === activeChat.id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username]
          }
          return prev
        })
      }
    }

    const handleUserStoppedTyping = (data) => {
      console.log('⏹️ User stopped typing:', data)
      setTypingUsers(prev => prev.filter(user => user !== data.username))
    }

    // Register event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectionError)
    socket.on('recentMessages', handleRecentMessages)
    socket.on('message', handleNewMessage)
    socket.on('onlineUsers', handleOnlineUsers)
    socket.on('typing', handleUserTyping)
    socket.on('stopTyping', handleUserStoppedTyping)

    // Cleanup function
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
      const newCounts = { ...prev }
      delete newCounts[user.id]
      return newCounts
    })
    
    // Join private chat room
    if (socket) {
      socket.emit('joinPrivateChat', { targetUserId: user.id })
    }
    
    setActiveChat(user)
    setMessages([]) // Clear messages while loading
    setTypingUsers([]) // Clear typing indicators
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
        targetUserId: activeChat.id
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

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <UserList 
        onlineUsers={onlineUsers} 
        currentUser={currentUser} 
        onUserSelect={handleUserSelect}
        activeChat={activeChat}
        unreadCounts={unreadCounts}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      <div className="flex-1 flex flex-col bg-white shadow-xl min-w-0">
        {/* Connection Status Bar */}
        <div className={`px-3 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm text-center transition-all ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="truncate">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {activeChat && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline truncate">Private chat with {activeChat.username}</span>
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

        {/* User Info & Logout Bar - Now responsive */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                <span className="hidden sm:inline">Logged in as </span>
                <span className="text-purple-600">{currentUser?.username}</span>
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                <span>{onlineUsers.length} online</span>
                {activeChat && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline truncate">With {activeChat.username}</span>
                  </>
                )}
              </div>
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

