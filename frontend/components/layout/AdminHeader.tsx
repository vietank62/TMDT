'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/firebase-auth'

export default function AdminHeader() {
  const { user } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-slate-900 flex items-center px-4 gap-4">
      <Link href="/admin" className="flex items-center gap-2 text-white font-bold">
        <Shield className="h-5 w-5 text-blue-400" />
        MicroMentor Admin
      </Link>
      <div className="flex-1" />
      <span className="text-sm text-slate-400">{user?.email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  )
}
