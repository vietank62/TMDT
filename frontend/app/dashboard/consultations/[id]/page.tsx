'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Download, FileText, MessageSquare, Star, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import StatusBadge from '@/components/common/StatusBadge'
import { Booking, BookingDocument, BookingStatus, ExpertProfile, Payment } from '@/types'
import { formatCurrency, formatDateTime, formatFileSize } from '@/lib/utils'
import { api } from '@/lib/api'

function DocumentRow({ doc }: { readonly doc: BookingDocument }) {
  async function handleDownload() {
    try {
      const url = await api.uploads.getDownloadUrl(doc.url)
      window.open(url, '_blank', 'noreferrer')
    } catch {
      window.open(doc.url, '_blank', 'noreferrer')
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="h-5 w-5 text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.name}</p>
        <p className="text-xs text-gray-400">{doc.size ? formatFileSize(doc.size) : doc.url}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleDownload()}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadDetail() {
      try {
        const bookingData = await api.bookings.byId(id)
        const [expertData, payments] = await Promise.all([
          api.experts.byId(bookingData.expertId).catch(() => null),
          api.payments.list().catch(() => []),
        ])
        if (mounted) {
          setBooking(bookingData)
          setExpert(expertData)
          setPayment(payments.find((item) => item.bookingId === bookingData.id) ?? null)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải chi tiết phiên tư vấn')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDetail()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <div className="text-sm text-gray-400">Đang tải...</div>
  }

  if (error || !booking) {
    return <div className="rounded-xl border bg-white p-6 text-sm text-red-500">{error || 'Không tìm thấy phiên tư vấn'}</div>
  }

  const canJoin = booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.PAID_CONFIRMED
  const canPay = booking.status === BookingStatus.APPROVED_AWAITING_PAYMENT
  const canReview = booking.status === BookingStatus.COMPLETED && !reviewSubmitted

  async function submitReview() {
    if (!reviewComment.trim()) {
      setReviewError('Vui lòng nhập nhận xét')
      return
    }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await api.reviews.create({ booking_id: booking!.id, rating: reviewRating, comment: reviewComment.trim() })
      setReviewSubmitted(true)
      setReviewOpen(false)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Không thể gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setReviewSubmitting(false)
    }
  }

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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={expert?.profilePictureUrl} />
                <AvatarFallback>{expert?.displayName?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{expert?.displayName ?? 'Chuyên gia'}</p>
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
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </CardContent>
          </Card>
        )}

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

        {canReview && (
          <Card className="border-dashed border-blue-300 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-medium text-gray-800 mb-1">Bạn thấy buổi tư vấn thế nào?</p>
              <p className="text-sm text-gray-500 mb-3">Chia sẻ trải nghiệm để giúp người dùng khác</p>
              <Button onClick={() => setReviewOpen(true)}>Viết đánh giá</Button>
            </CardContent>
          </Card>
        )}

        {reviewSubmitted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700">Cảm ơn bạn đã gửi đánh giá!</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Đánh giá buổi tư vấn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Xếp hạng</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Nhận xét</p>
                <Textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn..."
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                {reviewError && <p className="text-xs text-red-500 mt-1">{reviewError}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={reviewSubmitting}>Hủy</Button>
              <Button onClick={submitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
