import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { getBookingsByExpertId } from '@/data/bookings'
import { mockUsers } from '@/data/users'
import { BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'

const HISTORY_STATUSES = [
  BookingStatus.COMPLETED, BookingStatus.REJECTED, BookingStatus.CANCELLED_BY_USER,
  BookingStatus.CANCELLED_BY_EXPERT, BookingStatus.NO_SHOW_USER, BookingStatus.NO_SHOW_EXPERT,
  BookingStatus.REFUNDED, BookingStatus.EXPIRED_UNPAID,
]

export default function ExpertHistoryPage() {
  const history = getBookingsByExpertId('expert-1').filter((b) => HISTORY_STATUSES.includes(b.status))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Lịch sử tư vấn</h1>
        <p className="text-gray-500 text-sm mt-1">{history.length} phiên đã hoàn thành hoặc kết thúc</p>
      </div>

      {history.length === 0 ? (
        <EmptyState icon={Clock} title="Chưa có lịch sử tư vấn" />
      ) : (
        <div className="space-y-3">
          {history.map((booking) => {
            const user = mockUsers.find((u) => u.id === booking.userId)
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{user?.fullName[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-medium text-gray-900">{user?.fullName}</p>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
