'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CalendarDays, Clock, History, Star, TrendingUp, User, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BookingStatus, ExpertProfile } from '@/types'
import { api } from '@/lib/api'

const NAV_ITEMS = [
  { href: '/expert/profile', label: 'Hồ sơ chuyên gia', icon: User },
  { href: '/expert/availability', label: 'Lịch rảnh', icon: CalendarDays },
  { href: '/expert/requests', label: 'Yêu cầu chờ duyệt', icon: Clock },
  { href: '/expert/sessions', label: 'Phiên sắp tới', icon: Video },
  { href: '/expert/history', label: 'Lịch sử tư vấn', icon: History },
  { href: '/expert/earnings', label: 'Doanh thu', icon: TrendingUp },
  { href: '/expert/reviews', label: 'Đánh giá', icon: Star },
]

export default function ExpertSidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<ExpertProfile | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.experts.profile().catch(() => null),
      api.bookings.list().catch(() => []),
    ]).then(([expertProfile, bookings]) => {
      if (!mounted) return
      setProfile(expertProfile)
      setPendingCount(bookings.filter((booking) => booking.status === BookingStatus.PENDING_APPROVAL).length)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.profilePictureUrl} />
            <AvatarFallback>{profile?.displayName?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{profile?.displayName ?? 'Chuyên gia'}</p>
            <p className="text-xs text-green-600 font-medium">{profile?.profileStatus ?? 'Đang tải'}</p>
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
              {item.href === '/expert/requests' && pendingCount > 0 && (
                <Badge className="h-5 min-w-5 rounded-full bg-orange-500 px-1 text-xs">{pendingCount}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-0 w-64 px-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700">Chuyển sang trang người dùng</p>
          <Link href="/dashboard/consultations" className="text-xs text-blue-600 underline mt-1 block">
            Xem dashboard người dùng
          </Link>
        </div>
      </div>
    </aside>
  )
}
