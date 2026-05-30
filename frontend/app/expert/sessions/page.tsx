'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { Booking, BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

export default function ExpertSessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.bookings.list()
      .then((data) => {
        if (mounted) setBookings(data.filter((booking) => [BookingStatus.PAID_CONFIRMED, BookingStatus.IN_PROGRESS].includes(booking.status)))
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

  const emptyTitle = loading ? 'Đang tải...' : 'Không có phiên nào sắp tới'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Phiên sắp tới</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? 'Đang tải...' : `${bookings.length} phiên tư vấn sắp diễn ra`}</p>
      </div>

      {error ? (
        <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Calendar} title={emptyTitle} description="Các phiên đã được xác nhận thanh toán sẽ hiển thị ở đây." />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10"><AvatarFallback>{booking.userId[0] ?? '?'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">Người dùng #{booking.userId.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{booking.id}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{booking.problemDescription}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateTime(booking.scheduledAt)}</div>
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.durationMinutes} phút</div>
                      <span className="font-medium text-blue-600">{formatCurrency(booking.priceVnd)}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {(booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.PAID_CONFIRMED) && (
                        <Button size="sm" asChild>
                          <Link href={`/consultation/${booking.id}`}><Video className="h-4 w-4 mr-1" />Tham gia ngay</Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/consultations/${booking.id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
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
