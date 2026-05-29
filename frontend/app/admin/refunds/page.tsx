'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { RefundStatus } from '@/types'
import { formatCurrency, formatDate, getRefundStatusLabel } from '@/lib/utils'
import { AdminRefund, api } from '@/lib/api'

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ open: boolean; type: 'approve' | 'reject'; id: string }>({ open: false, type: 'approve', id: '' })

  useEffect(() => {
    let mounted = true
    api.admin.refunds()
      .then((data) => {
        if (mounted) setRefunds(data)
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

  function handleAction(id: string, type: 'approve' | 'reject') {
    setDialog({ open: true, type, id })
  }

  async function confirm() {
    const updated =
      dialog.type === 'approve'
        ? await api.admin.processRefund(dialog.id)
        : await api.admin.rejectRefund(dialog.id)
    setRefunds((prev) => prev.map((refund) => (refund.id === updated.id ? updated : refund)))
  }

  const pending = refunds.filter((refund) => refund.status === RefundStatus.PENDING)
  const processed = refunds.filter((refund) => refund.status !== RefundStatus.PENDING)

  function RefundCard({ refund }: { refund: AdminRefund }) {
    const isPending = refund.status === RefundStatus.PENDING
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{refund.userName}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${refund.status === RefundStatus.PROCESSED ? 'bg-green-100 text-green-700' : refund.status === RefundStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {getRefundStatusLabel(refund.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Mã đặt lịch: {refund.bookingId}</p>
              <p className="text-sm text-gray-500 mt-0.5">Chuyên gia: {refund.expertName}</p>
              <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                <span>Yêu cầu: {formatDate(refund.requestedAt)}</span>
                <span className="font-bold text-blue-600 text-sm">{formatCurrency(refund.amount)}</span>
              </div>
              {refund.adminNote && <p className="text-xs text-gray-400 mt-1 italic">{refund.adminNote}</p>}
            </div>
            {isPending && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => handleAction(refund.id, 'approve')}>Duyệt hoàn tiền</Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(refund.id, 'reject')}>Từ chối</Button>
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

      {error && <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>}

      {!error && pending.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Yêu cầu chờ xử lý</p>
          <div className="space-y-3">{pending.map((refund) => <RefundCard key={refund.id} refund={refund} />)}</div>
        </div>
      )}

      {!error && processed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Đã xử lý</p>
          <div className="space-y-3">{processed.map((refund) => <RefundCard key={refund.id} refund={refund} />)}</div>
        </div>
      )}

      {!error && !loading && refunds.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-gray-400">Không có yêu cầu hoàn tiền</CardContent></Card>
      )}

      <ConfirmDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        title={dialog.type === 'approve' ? 'Duyệt hoàn tiền' : 'Từ chối hoàn tiền'}
        description={dialog.type === 'approve' ? 'Xác nhận hoàn tiền cho người dùng?' : 'Xác nhận từ chối yêu cầu hoàn tiền này?'}
        confirmLabel={dialog.type === 'approve' ? 'Duyệt' : 'Từ chối'}
        variant={dialog.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={confirm}
      />
    </div>
  )
}
