'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Rocket, Settings, Star, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getNotificationsByUserId, getUnreadCount } from '@/data/notifications'
import { formatRelativeTime } from '@/lib/utils'

const CURRENT_USER = {
  id: 'user-1',
  fullName: 'Nguyễn Thị Mai',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai&backgroundColor=b6e3f4',
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const notifications = getNotificationsByUserId(CURRENT_USER.id).slice(0, 5)
  const unreadCount = getUnreadCount(CURRENT_USER.id)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Rocket className="h-5 w-5 fill-blue-600" />
          MicroMentor
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/experts" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Chuyên gia
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Về chúng tôi
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">Thông báo</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} mới</Badge>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Không có thông báo</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-3 py-2.5 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${n.isRead ? '' : 'bg-blue-50'}`}
                    >
                      <p className="text-sm font-medium text-gray-800 leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t">
                <Link href="/dashboard/notifications" className="text-xs text-blue-600 hover:underline">
                  Xem tất cả thông báo
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.fullName} />
                  <AvatarFallback>{CURRENT_USER.fullName[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">{CURRENT_USER.fullName}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/consultations" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Bảng điều khiển
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/expert/requests" className="flex items-center gap-2">
                  <Star className="h-4 w-4" /> Chuyên gia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sign-in" className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <Link href="/experts" className="block py-2 text-sm font-medium text-gray-700">
            Chuyên gia
          </Link>
          <Link href="/about" className="block py-2 text-sm font-medium text-gray-700">
            Về chúng tôi
          </Link>
          <Link href="/dashboard/consultations" className="block py-2 text-sm font-medium text-gray-700">
            Bảng điều khiển
          </Link>
        </div>
      )}
    </header>
  )
}
