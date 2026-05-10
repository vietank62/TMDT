import { Card, CardContent } from '@/components/ui/card'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import KPIStatCard from '@/components/common/KPIStatCard'
import { mockPayments } from '@/data/payments'
import { getExpertById } from '@/data/experts'
import { mockUsers } from '@/data/users'
import { Payment, PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, DollarSign, TrendingDown } from 'lucide-react'

type PaymentRow = Payment & { userName: string; expertName: string }

const data: PaymentRow[] = mockPayments.map((p) => ({
  ...p,
  userName: mockUsers.find((u) => u.id === p.userId)?.fullName ?? '—',
  expertName: getExpertById(p.expertId)?.displayName ?? '—',
}))

const columns: Column<PaymentRow>[] = [
  { key: 'createdAt', label: 'Ngày', render: (v) => <span className="text-sm">{formatDate(String(v))}</span> },
  { key: 'userName', label: 'Người dùng', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'expertName', label: 'Chuyên gia', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'amount', label: 'Số tiền', render: (v) => <span className="text-sm font-semibold text-blue-600">{formatCurrency(Number(v))}</span> },
  { key: 'transferCode', label: 'Mã GD', render: (v) => <span className="text-xs font-mono">{String(v ?? '—')}</span> },
  { key: 'status', label: 'Trạng thái', render: (v) => <StatusBadge status={v as PaymentStatus} /> },
]

const totalPaid = data.filter((p) => p.status === PaymentStatus.PAID).reduce((s, p) => s + p.amount, 0)
const totalPending = data.filter((p) => p.status === PaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0)
const totalRefunded = data.filter((p) => p.status === PaymentStatus.REFUNDED).reduce((s, p) => s + p.amount, 0)

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Quản lý thanh toán</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard title="Tổng đã thu" value={formatCurrency(totalPaid)} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Đang chờ" value={formatCurrency(totalPending)} icon={CreditCard} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
        <KPIStatCard title="Đã hoàn" value={formatCurrency(totalRefunded)} icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data} emptyMessage="Không có thanh toán nào" />
        </CardContent>
      </Card>
    </div>
  )
}
