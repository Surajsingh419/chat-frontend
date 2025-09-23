// src/utils/socket.js
import { io } from 'socket.io-client'
import Cookies from 'js-cookie'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const token = Cookies.get('token')
    
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      autoConnect: false
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