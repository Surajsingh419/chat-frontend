// src/utils/socket.js - Updated version
import { io } from 'socket.io-client'
import Cookies from 'js-cookie'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const token = Cookies.get('token')
    
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Add polling as fallback
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    })

    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
    })
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
