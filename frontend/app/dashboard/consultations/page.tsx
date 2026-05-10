'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, FileText, Video } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { getBookingsByUserId } from '@/data/bookings'
import { getExpertById } from '@/data/experts'
import { mockUsers } from '@/data/users'
import { BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'

const UPCOMING_STATUSES = [
  BookingStatus.PAID_CONFIRMED,
  BookingStatus.APPROVED_AWAITING_PAYMENT,
  BookingStatus.PENDING_APPROVAL,
  BookingStatus.IN_PROGRESS,
]
const HISTORY_STATUSES = [
  BookingStatus.COMPLETED,
  BookingStatus.REJECTED,
  BookingStatus.CANCELLED_BY_USER,
  BookingStatus.CANCELLED_BY_EXPERT,
  BookingStatus.REFUNDED,
  BookingStatus.EXPIRED_UNPAID,
  BookingStatus.NO_SHOW_USER,
  BookingStatus.NO_SHOW_EXPERT,
]

function BookingCard({ booking, viewAs }: { booking: ReturnType<typeof getBookingsByUserId>[0]; viewAs: 'user' | 'expert' }) {
  const expert = getExpertById(booking.expertId)
  const user = mockUsers.find((u) => u.id === booking.userId)
  const other = viewAs === 'user' ? expert : user

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarImage src={viewAs === 'user' ? expert?.profilePictureUrl : user?.avatarUrl} />
            <AvatarFallback>{(viewAs === 'user' ? expert?.displayName : user?.fullName)?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900">{viewAs === 'user' ? expert?.displayName : user?.fullName}</p>
                {viewAs === 'user' && <p className="text-xs text-gray-500">{expert?.title} · {expert?.company}</p>}
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{booking.problemDescription}</p>
            <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDateTime(booking.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{booking.durationMinutes} phút</span>
              </div>
              {booking.documents.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{booking.documents.length} tài liệu</span>
                </div>
              )}
              <span className="font-medium text-blue-600">{formatCurrency(booking.priceVnd)}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/consultations/${booking.id}`}>Xem chi tiết</Link>
              </Button>
              {booking.status === BookingStatus.IN_PROGRESS && (
                <Button size="sm" asChild>
                  <Link href={`/consultation/${booking.id}`}>
                    <Video className="h-4 w-4 mr-1" />
                    Tham gia ngay
                  </Link>
                </Button>
              )}
              {booking.status === BookingStatus.APPROVED_AWAITING_PAYMENT && (
                <Button size="sm" asChild>
                  <Link href={`/payment/${booking.id}`}>Thanh toán ngay</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConsultationsPage() {
  const bookings = getBookingsByUserId('user-1')
  const upcomingAsUser = bookings.filter((b) => UPCOMING_STATUSES.includes(b.status))
  const historyAsUser = bookings.filter((b) => HISTORY_STATUSES.includes(b.status))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Phiên tư vấn</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý tất cả các buổi tư vấn của bạn</p>
      </div>

      <Tabs defaultValue="as-user">
        <TabsList className="mb-4">
          <TabsTrigger value="as-user">
            Tôi được tư vấn
            {upcomingAsUser.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-blue-600">{upcomingAsUser.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="as-expert">Tôi tư vấn</TabsTrigger>
        </TabsList>

        <TabsContent value="as-user">
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Sắp tới ({upcomingAsUser.length})</TabsTrigger>
              <TabsTrigger value="history">Lịch sử ({historyAsUser.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              {upcomingAsUser.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Chưa có phiên tư vấn nào"
                  description="Tìm kiếm và đặt lịch tư vấn với chuyên gia phù hợp"
                  actionLabel="Tìm chuyên gia"
                  actionHref="/experts"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingAsUser.map((b) => <BookingCard key={b.id} booking={b} viewAs="user" />)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="history">
              {historyAsUser.length === 0 ? (
                <EmptyState icon={Clock} title="Chưa có lịch sử tư vấn" />
              ) : (
                <div className="space-y-3">
                  {historyAsUser.map((b) => <BookingCard key={b.id} booking={b} viewAs="user" />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="as-expert">
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-500 text-sm">Bạn chưa đăng ký làm chuyên gia.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/become-expert">Đăng ký chuyên gia ngay</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
