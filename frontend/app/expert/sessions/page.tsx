import Link from 'next/link'
import { Calendar, Clock, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { getBookingsByExpertId } from '@/data/bookings'
import { mockUsers } from '@/data/users'
import { BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'

export default function ExpertSessionsPage() {
  const upcoming = getBookingsByExpertId('expert-1').filter((b) =>
    [BookingStatus.PAID_CONFIRMED, BookingStatus.IN_PROGRESS].includes(b.status)
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Phiên sắp tới</h1>
        <p className="text-gray-500 text-sm mt-1">{upcoming.length} phiên tư vấn sắp diễn ra</p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={Calendar} title="Không có phiên nào sắp tới" description="Các phiên đã được xác nhận thanh toán sẽ hiển thị ở đây." />
      ) : (
        <div className="space-y-3">
          {upcoming.map((booking) => {
            const user = mockUsers.find((u) => u.id === booking.userId)
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10"><AvatarFallback>{user?.fullName[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
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
                        {booking.status === BookingStatus.IN_PROGRESS && (
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
            )
          })}
        </div>
      )}
    </div>
  )
}
