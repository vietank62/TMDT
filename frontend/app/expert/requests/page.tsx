'use client'

import { useState } from 'react'
import { Calendar, Clock, FileText, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import { getPendingBookingsForExpert } from '@/data/bookings'
import { mockUsers } from '@/data/users'
import { Booking } from '@/types'
import { formatDateTime, formatCurrency, formatFileSize } from '@/lib/utils'

export default function ExpertRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>(getPendingBookingsForExpert('expert-1'))
  const [confirmState, setConfirmState] = useState<{
    open: boolean; type: 'accept' | 'reject' | 'info'; bookingId: string; note: string
  }>({ open: false, type: 'accept', bookingId: '', note: '' })

  function handleAction(id: string, action: 'accept' | 'reject' | 'info') {
    setConfirmState({ open: true, type: action, bookingId: id, note: '' })
  }

  function confirmAction() {
    setBookings((prev) => prev.filter((b) => b.id !== confirmState.bookingId))
  }

  const actionConfig = {
    accept: { title: 'Xác nhận chấp nhận yêu cầu', desc: 'Bạn sẽ xác nhận buổi tư vấn này. Người dùng sẽ được thông báo để thanh toán.', label: 'Chấp nhận', variant: 'default' as const },
    reject: { title: 'Xác nhận từ chối yêu cầu', desc: 'Bạn sẽ từ chối yêu cầu tư vấn này.', label: 'Từ chối', variant: 'destructive' as const },
    info: { title: 'Yêu cầu thêm thông tin', desc: 'Nhập nội dung bạn muốn người dùng bổ sung:', label: 'Gửi yêu cầu', variant: 'default' as const },
  }

  const config = actionConfig[confirmState.type]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Yêu cầu chờ duyệt</h1>
        <p className="text-gray-500 text-sm mt-1">
          {bookings.length > 0 ? `${bookings.length} yêu cầu đang chờ xử lý` : 'Không có yêu cầu nào'}
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Không có yêu cầu nào đang chờ"
          description="Khi có người dùng gửi yêu cầu tư vấn, chúng sẽ xuất hiện ở đây."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const user = mockUsers.find((u) => u.id === booking.userId)
            return (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback>{user?.fullName[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Chờ duyệt</Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDateTime(booking.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{booking.durationMinutes} phút</span>
                        </div>
                        <span className="font-medium text-blue-600">{formatCurrency(booking.priceVnd)}</span>
                      </div>

                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">Mô tả vấn đề</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{booking.problemDescription}</p>
                        {booking.sessionGoals && (
                          <p className="text-xs text-gray-500 mt-2 italic">Mục tiêu: {booking.sessionGoals}</p>
                        )}
                      </div>

                      {booking.documents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {booking.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium truncate max-w-32">{doc.name}</span>
                              <span className="text-gray-400">{formatFileSize(doc.size)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => handleAction(booking.id, 'accept')}>
                          Chấp nhận
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(booking.id, 'reject')}>
                          Từ chối
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(booking.id, 'info')}>
                          Yêu cầu bổ sung
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

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={config?.title ?? ''}
        description={confirmState.type !== 'info' ? config?.desc : undefined}
        confirmLabel={config?.label}
        variant={config?.variant}
        onConfirm={confirmAction}
      >
        {confirmState.type === 'info' && (
          <Textarea
            placeholder="Nhập nội dung cần bổ sung..."
            value={confirmState.note}
            onChange={(e) => setConfirmState((s) => ({ ...s, note: e.target.value }))}
            rows={3}
          />
        )}
        {confirmState.type === 'reject' && (
          <Textarea
            placeholder="Lý do từ chối (tùy chọn)..."
            value={confirmState.note}
            onChange={(e) => setConfirmState((s) => ({ ...s, note: e.target.value }))}
            rows={3}
          />
        )}
      </ConfirmDialog>
    </div>
  )
}
