'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { mockRefunds } from '@/data/payments'
import { mockUsers } from '@/data/users'
import { Refund, RefundStatus } from '@/types'
import { formatCurrency, formatDate, getRefundStatusLabel } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState(mockRefunds)
  const [dialog, setDialog] = useState<{ open: boolean; type: 'approve' | 'reject'; id: string }>({ open: false, type: 'approve', id: '' })

  function handleAction(id: string, type: 'approve' | 'reject') {
    setDialog({ open: true, type, id })
  }

  function confirm() {
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === dialog.id
          ? { ...r, status: dialog.type === 'approve' ? RefundStatus.PROCESSED : RefundStatus.REJECTED }
          : r
      )
    )
  }

  const pending = refunds.filter((r) => r.status === RefundStatus.PENDING)
  const processed = refunds.filter((r) => r.status !== RefundStatus.PENDING)

  function RefundCard({ r }: { r: Refund }) {
    const user = mockUsers.find((u) => u.id === r.userId)
    const isPending = r.status === RefundStatus.PENDING
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${r.status === RefundStatus.PROCESSED ? 'bg-green-100 text-green-700' : r.status === RefundStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {getRefundStatusLabel(r.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Mã đặt lịch: {r.bookingId}</p>
              <p className="text-sm text-gray-600 mt-1">{r.reason}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                <span>Yêu cầu: {formatDate(r.requestedAt)}</span>
                <span className="font-bold text-blue-600 text-sm">{formatCurrency(r.amount)}</span>
              </div>
              {r.adminNote && <p className="text-xs text-gray-400 mt-1 italic">{r.adminNote}</p>}
            </div>
            {isPending && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => handleAction(r.id, 'approve')}>Duyệt hoàn tiền</Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, 'reject')}>Từ chối</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý hoàn tiền</h1>
        {pending.length > 0 && <Badge className="bg-orange-500"><AlertCircle className="h-3 w-3 mr-1" />{pending.length} chờ xử lý</Badge>}
      </div>

      {pending.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Yêu cầu chờ xử lý</p>
          <div className="space-y-3">{pending.map((r) => <RefundCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Đã xử lý</p>
          <div className="space-y-3">{processed.map((r) => <RefundCard key={r.id} r={r} />)}</div>
        </div>
      )}

      <ConfirmDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        title={dialog.type === 'approve' ? 'Duyệt hoàn tiền' : 'Từ chối hoàn tiền'}
        description={dialog.type === 'approve' ? 'Xác nhận hoàn tiền cho người dùng?' : 'Xác nhận từ chối yêu cầu hoàn tiền này?'}
        confirmLabel={dialog.type === 'approve' ? 'Duyệt' : 'Từ chối'}
        variant={dialog.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={confirm}
      />
    </div>
  )
}
