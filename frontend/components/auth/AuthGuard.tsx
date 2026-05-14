'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function AuthGuard({ children, requiredRole }: Props) {
  const { user, roles, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.replace('/sign-in')
      return
    }
    if (requiredRole && !roles.includes(requiredRole)) {
      router.replace('/dashboard/consultations')
    }
  }, [user, roles, initialized, requiredRole, router])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return null
  if (requiredRole && !roles.includes(requiredRole)) return null

  return <>{children}</>
}
