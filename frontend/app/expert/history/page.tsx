'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { Booking, BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

const HISTORY_STATUSES = [
  BookingStatus.COMPLETED, BookingStatus.REJECTED, BookingStatus.CANCELLED_BY_USER,
  BookingStatus.CANCELLED_BY_EXPERT, BookingStatus.NO_SHOW_USER, BookingStatus.NO_SHOW_EXPERT,
  BookingStatus.REFUNDED, BookingStatus.EXPIRED_UNPAID,
]

export default function ExpertHistoryPage() {
  const [history, setHistory] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.bookings.list()
      .then((data) => {
        if (mounted) setHistory(data.filter((booking) => HISTORY_STATUSES.includes(booking.status)))
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Lịch sử tư vấn</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? 'Đang tải...' : `${history.length} phiên đã hoàn thành hoặc kết thúc`}</p>
      </div>

      {error ? (
        <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>
      ) : history.length === 0 ? (
        <EmptyState icon={Clock} title={loading ? 'Đang tải...' : 'Chưa có lịch sử tư vấn'} />
      ) : (
        <div className="space-y-3">
          {history.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback>{booking.userId[0] ?? '?'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-medium text-gray-900">Người dùng #{booking.userId.slice(0, 8)}</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{booking.problemDescription}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateTime(booking.scheduledAt)}</div>
                      <span className="font-medium text-blue-600">{formatCurrency(booking.priceVnd)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" asChild>
                      <Link href={`/dashboard/consultations/${booking.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
