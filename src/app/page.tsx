'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('token')
        const userData = Cookies.get('user')
        
        console.log('Token exists:', !!token)
        console.log('User data exists:', !!userData)
        
        if (token && userData) {
          console.log('Redirecting to chat...')
          router.replace('/chat') // Use replace instead of push
        } else {
          console.log('Redirecting to login...')
          router.replace('/login')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.replace('/login')
      } finally {
        // Small delay to prevent flash
        setTimeout(() => setLoading(false), 500)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication status
          </p>
        </div>
      </div>
    )
  }

  // This should rarely be seen due to redirects
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  )
}
