'use client'

import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/common/EmptyState'
import { Notification, NotificationType } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.BOOKING_ACCEPTED]: '✓',
  [NotificationType.BOOKING_REJECTED]: '!',
  [NotificationType.PAYMENT_SUCCESS]: '$',
  [NotificationType.SESSION_REMINDER]: '•',
  [NotificationType.REFUND_SUCCESS]: '$',
  [NotificationType.NEW_REVIEW]: '*',
  [NotificationType.APPLICATION_APPROVED]: '✓',
  [NotificationType.APPLICATION_REJECTED]: '!',
  [NotificationType.PROFILE_UPDATE_APPROVED]: '✓',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.notifications.list()
      .then((data) => {
        if (mounted) setNotifications(data)
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  async function markAllRead() {
    await api.notifications.markAllRead()
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  async function markRead(id: string) {
    await api.notifications.markRead(id)
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Đang tải...' : unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={loading ? 'Đang tải...' : 'Không có thông báo nào'}
          description="Các thông báo về buổi tư vấn, thanh toán sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => markRead(notification.id)}
              className={cn(
                'flex w-full gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-gray-50',
                !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white',
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                {TYPE_ICONS[notification.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium leading-tight', !notification.isRead ? 'text-blue-900' : 'text-gray-900')}>
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <Badge className="h-2 w-2 rounded-full p-0 bg-blue-500 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatRelativeTime(notification.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
