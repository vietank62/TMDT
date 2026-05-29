'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import { BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { AdminBooking, api } from '@/lib/api'

const columns: Column<AdminBooking>[] = [
  { key: 'userName', label: 'Người dùng', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
  { key: 'expertName', label: 'Chuyên gia', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'scheduledAt', label: 'Thời gian', render: (v) => <span className="text-sm">{formatDateTime(String(v))}</span> },
  { key: 'priceVnd', label: 'Giá trị', render: (v) => <span className="text-sm font-medium text-blue-600">{formatCurrency(Number(v))}</span> },
  { key: 'status', label: 'Trạng thái', render: (v) => <StatusBadge status={v as BookingStatus} /> },
]

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.bookings()
      .then((data) => {
        if (mounted) setBookings(data)
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

  const completed = bookings.filter((b) => b.status === BookingStatus.COMPLETED).length
  const pending = bookings.filter((b) => b.status === BookingStatus.PENDING_APPROVAL).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý phiên tư vấn</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{loading ? 'Đang tải...' : `${bookings.length} tổng`}</Badge>
          <Badge className="bg-green-100 text-green-700">{completed} hoàn thành</Badge>
          <Badge className="bg-yellow-100 text-yellow-700">{pending} chờ duyệt</Badge>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={bookings} emptyMessage={loading ? 'Đang tải...' : 'Không có phiên tư vấn nào'} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
