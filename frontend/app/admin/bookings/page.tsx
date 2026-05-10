import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import { mockBookings } from '@/data/bookings'
import { getExpertById } from '@/data/experts'
import { mockUsers } from '@/data/users'
import { Booking, BookingStatus } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'

type BookingRow = Booking & { userName: string; expertName: string }

const data: BookingRow[] = mockBookings.map((b) => ({
  ...b,
  userName: mockUsers.find((u) => u.id === b.userId)?.fullName ?? '—',
  expertName: getExpertById(b.expertId)?.displayName ?? '—',
}))

const columns: Column<BookingRow>[] = [
  { key: 'userName', label: 'Người dùng', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
  { key: 'expertName', label: 'Chuyên gia', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'scheduledAt', label: 'Thời gian', render: (v) => <span className="text-sm">{formatDateTime(String(v))}</span> },
  { key: 'priceVnd', label: 'Giá trị', render: (v) => <span className="text-sm font-medium text-blue-600">{formatCurrency(Number(v))}</span> },
  { key: 'status', label: 'Trạng thái', render: (v) => <StatusBadge status={v as BookingStatus} /> },
]

export default function AdminBookingsPage() {
  const completed = data.filter((b) => b.status === BookingStatus.COMPLETED).length
  const pending = data.filter((b) => b.status === BookingStatus.PENDING_APPROVAL).length
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý phiên tư vấn</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{data.length} tổng</Badge>
          <Badge className="bg-green-100 text-green-700">{completed} hoàn thành</Badge>
          <Badge className="bg-yellow-100 text-yellow-700">{pending} chờ duyệt</Badge>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data} emptyMessage="Không có phiên tư vấn nào" />
        </CardContent>
      </Card>
    </div>
  )
}
