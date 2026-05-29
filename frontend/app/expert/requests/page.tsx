'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, FileText, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import { Booking, BookingStatus } from '@/types'
import { formatDateTime, formatCurrency, formatFileSize } from '@/lib/utils'
import { api } from '@/lib/api'

export default function ExpertRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmState, setConfirmState] = useState<{
    open: boolean; type: 'accept' | 'reject'; bookingId: string; note: string
  }>({ open: false, type: 'accept', bookingId: '', note: '' })

  useEffect(() => {
    let mounted = true
    api.bookings.list()
      .then((data) => {
        if (mounted) setBookings(data.filter((booking) => booking.status === BookingStatus.PENDING_APPROVAL))
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

  function handleAction(id: string, action: 'accept' | 'reject') {
    setConfirmState({ open: true, type: action, bookingId: id, note: '' })
  }

  async function confirmAction() {
    if (confirmState.type === 'accept') {
      await api.bookings.approve(confirmState.bookingId, confirmState.note)
    } else {
      await api.bookings.reject(confirmState.bookingId, confirmState.note || 'Chuyên gia từ chối yêu cầu')
    }
    setBookings((prev) => prev.filter((booking) => booking.id !== confirmState.bookingId))
  }

  const config = confirmState.type === 'accept'
    ? { title: 'Xác nhận chấp nhận yêu cầu', desc: 'Người dùng sẽ được thông báo để thanh toán.', label: 'Chấp nhận', variant: 'default' as const }
    : { title: 'Xác nhận từ chối yêu cầu', desc: 'Bạn sẽ từ chối yêu cầu tư vấn này.', label: 'Từ chối', variant: 'destructive' as const }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Yêu cầu chờ duyệt</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? 'Đang tải...' : bookings.length > 0 ? `${bookings.length} yêu cầu đang chờ xử lý` : 'Không có yêu cầu nào'}
        </p>
      </div>

      {error ? (
        <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Clock} title={loading ? 'Đang tải...' : 'Không có yêu cầu nào đang chờ'} description="Khi có người dùng gửi yêu cầu tư vấn, chúng sẽ xuất hiện ở đây." />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback>{booking.userId[0] ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900">Người dùng #{booking.userId.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{booking.id}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Chờ duyệt</Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{formatDateTime(booking.scheduledAt)}</span></div>
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{booking.durationMinutes} phút</span></div>
                      <span className="font-medium text-blue-600">{formatCurrency(booking.priceVnd)}</span>
                    </div>

                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">Mô tả vấn đề</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{booking.problemDescription}</p>
                      {booking.sessionGoals && <p className="text-xs text-gray-500 mt-2 italic">Mục tiêu: {booking.sessionGoals}</p>}
                    </div>

                    {booking.documents.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {booking.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium truncate max-w-32">{doc.name}</span>
                            <span className="text-gray-400">{doc.size ? formatFileSize(doc.size) : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleAction(booking.id, 'accept')}>Chấp nhận</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(booking.id, 'reject')}>Từ chối</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((state) => ({ ...state, open }))}
        title={config.title}
        description={config.desc}
        confirmLabel={config.label}
        variant={config.variant}
        onConfirm={confirmAction}
      >
        <Textarea
          placeholder={confirmState.type === 'accept' ? 'Ghi chú cho người dùng (tùy chọn)...' : 'Lý do từ chối...'}
          value={confirmState.note}
          onChange={(event) => setConfirmState((state) => ({ ...state, note: event.target.value }))}
          rows={3}
        />
      </ConfirmDialog>
    </div>
  )
}
