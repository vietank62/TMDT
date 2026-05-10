import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Download, FileText, MessageSquare, Star, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/common/StatusBadge'
import ReviewCard from '@/components/common/ReviewCard'
import { getBookingById } from '@/data/bookings'
import { getExpertById } from '@/data/experts'
import { mockPayments } from '@/data/payments'
import { mockReviews } from '@/data/reviews'
import { BookingStatus } from '@/types'
import { formatCurrency, formatDateTime, formatFileSize } from '@/lib/utils'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = getBookingById(id)

  if (!booking) notFound()

  const expert = getExpertById(booking.expertId)
  const payment = mockPayments.find((p) => p.bookingId === booking.id)
  const review = mockReviews.find((r) => r.bookingId === booking.id)

  const canJoin = booking.status === BookingStatus.IN_PROGRESS
  const canPay = booking.status === BookingStatus.APPROVED_AWAITING_PAYMENT
  const canReview = booking.status === BookingStatus.COMPLETED && !review

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/consultations"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chi tiết phiên tư vấn</h1>
          <p className="text-xs text-gray-400">#{booking.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Expert info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={expert?.profilePictureUrl} />
                <AvatarFallback>{expert?.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{expert?.displayName}</p>
                    <p className="text-sm text-gray-500">{expert?.title} · {expert?.company}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(booking.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{booking.durationMinutes} phút</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {(canJoin || canPay) && (
          <div className="flex gap-3">
            {canJoin && (
              <Button asChild className="flex-1">
                <Link href={`/consultation/${booking.id}`}>
                  <Video className="h-4 w-4 mr-2" />
                  Tham gia buổi tư vấn
                </Link>
              </Button>
            )}
            {canPay && (
              <Button asChild className="flex-1">
                <Link href={`/payment/${booking.id}`}>Thanh toán ngay</Link>
              </Button>
            )}
          </div>
        )}

        {booking.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700 text-sm mb-1">Lý do từ chối</p>
            <p className="text-sm text-red-600">{booking.rejectionReason}</p>
          </div>
        )}

        {/* Problem description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Mô tả vấn đề
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">{booking.problemDescription}</p>
            {booking.sessionGoals && (
              <>
                <Separator className="my-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Mục tiêu buổi tư vấn</p>
                <p className="text-sm text-gray-600">{booking.sessionGoals}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        {booking.documents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Tài liệu đính kèm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {booking.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(doc.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Payment */}
        {payment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền</span>
                <span className="font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mã giao dịch</span>
                <span className="font-mono text-xs">{payment.transferCode ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái</span>
                <StatusBadge status={payment.status} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review */}
        {review && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Đánh giá của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewCard review={review} />
            </CardContent>
          </Card>
        )}

        {canReview && (
          <Card className="border-dashed border-blue-300 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-medium text-gray-800 mb-1">Bạn thấy buổi tư vấn thế nào?</p>
              <p className="text-sm text-gray-500 mb-3">Chia sẻ trải nghiệm để giúp người dùng khác</p>
              <Button>Viết đánh giá</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
