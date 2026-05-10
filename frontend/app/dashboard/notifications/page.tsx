'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/common/EmptyState'
import { getNotificationsByUserId } from '@/data/notifications'
import { Notification, NotificationType } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.BOOKING_ACCEPTED]: '✅',
  [NotificationType.BOOKING_REJECTED]: '❌',
  [NotificationType.PAYMENT_SUCCESS]: '💳',
  [NotificationType.SESSION_REMINDER]: '🔔',
  [NotificationType.REFUND_SUCCESS]: '💰',
  [NotificationType.NEW_REVIEW]: '⭐',
  [NotificationType.APPLICATION_APPROVED]: '🎉',
  [NotificationType.APPLICATION_REJECTED]: '😔',
  [NotificationType.PROFILE_UPDATE_APPROVED]: '✨',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(
    getNotificationsByUserId('user-1')
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Không có thông báo nào"
          description="Các thông báo về buổi tư vấn, thanh toán sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                'flex gap-4 rounded-xl border p-4 cursor-pointer transition-colors hover:bg-gray-50',
                !n.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
              )}
            >
              <span className="text-2xl shrink-0">{TYPE_ICONS[n.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium leading-tight', !n.isRead ? 'text-blue-900' : 'text-gray-900')}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <Badge className="h-2 w-2 rounded-full p-0 bg-blue-500 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
