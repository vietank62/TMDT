'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Shield,
  Star,
  UserCheck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/experts', label: 'Chuyên gia', icon: UserCheck },
  { href: '/admin/applications', label: 'Hồ sơ chờ duyệt', icon: FileText },
  { href: '/admin/bookings', label: 'Phiên tư vấn', icon: Calendar },
  { href: '/admin/payments', label: 'Thanh toán', icon: CreditCard },
  { href: '/admin/refunds', label: 'Hoàn tiền', icon: RefreshCw },
  { href: '/admin/reviews', label: 'Đánh giá', icon: Star },
  { href: '/admin/analytics', label: 'Báo cáo', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-400" />
          <div>
            <p className="font-bold text-white text-sm">Admin Panel</p>
            <p className="text-xs text-slate-400">MicroMentor</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
