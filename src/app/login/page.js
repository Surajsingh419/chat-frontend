// frontend/src/app/login/page.js
'use client'
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.push('/chat')
    }
  }, [router])

  return (
    <div>
      <LoginForm />
    </div>
  )
}
