'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Calendar, CreditCard, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

const NAV_ITEMS = [
  { href: '/dashboard/consultations', label: 'Phiên tư vấn', icon: Calendar },
  { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: User },
  { href: '/dashboard/payments', label: 'Lịch sử thanh toán', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Thông báo', icon: Bell },
  { href: '/dashboard/become-expert', label: 'Đăng ký chuyên gia', icon: Star },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    api.notifications.list()
      .then((notifications) => {
        if (mounted) setUnreadCount(notifications.filter((notification) => !notification.isRead).length)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const displayName = user?.displayName ?? user?.email ?? 'Người dùng'

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL ?? undefined} />
            <AvatarFallback>{displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                <Badge className="h-5 min-w-5 rounded-full bg-red-500 px-1 text-xs">{unreadCount}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-0 w-64 px-3">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700">Chuyển sang trang chuyên gia</p>
          <Link href="/expert/requests" className="text-xs text-blue-600 underline mt-1 block">
            Xem dashboard chuyên gia
          </Link>
        </div>
      </div>
    </aside>
  )
}
