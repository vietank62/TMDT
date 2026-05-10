import { Download, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import KPIStatCard from '@/components/common/KPIStatCard'
import { mockPayments } from '@/data/payments'
import { getExpertById } from '@/data/experts'
import { Payment, PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, TrendingUp } from 'lucide-react'

const userPayments = mockPayments.filter((p) => p.userId === 'user-1')

const columns: Column<Payment & { expertName: string }>[] = [
  {
    key: 'createdAt',
    label: 'Ngày',
    render: (v) => <span className="text-sm">{formatDate(String(v))}</span>,
  },
  {
    key: 'expertName',
    label: 'Chuyên gia',
    render: (v) => <span className="text-sm font-medium">{String(v)}</span>,
  },
  {
    key: 'amount',
    label: 'Số tiền',
    render: (v) => <span className="text-sm font-semibold text-blue-600">{formatCurrency(Number(v))}</span>,
  },
  {
    key: 'transferCode',
    label: 'Mã GD',
    render: (v) => <span className="text-xs font-mono text-gray-500">{String(v ?? '—')}</span>,
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (v) => <StatusBadge status={v as PaymentStatus} />,
  },
  {
    key: 'id',
    label: '',
    render: () => (
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Download className="h-4 w-4" />
      </Button>
    ),
  },
]

export default function PaymentsPage() {
  const tableData = userPayments.map((p) => ({
    ...p,
    expertName: getExpertById(p.expertId)?.displayName ?? '—',
  }))

  const totalPaid = userPayments.filter((p) => p.status === PaymentStatus.PAID).reduce((s, p) => s + p.amount, 0)
  const totalRefunded = userPayments.filter((p) => p.status === PaymentStatus.REFUNDED).reduce((s, p) => s + p.amount, 0)
  const totalSessions = userPayments.filter((p) => p.status === PaymentStatus.PAID).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi tất cả giao dịch của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard
          title="Tổng đã thanh toán"
          value={formatCurrency(totalPaid)}
          icon={CreditCard}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPIStatCard
          title="Số buổi tư vấn"
          value={totalSessions}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KPIStatCard
          title="Đã hoàn tiền"
          value={formatCurrency(totalRefunded)}
          icon={Receipt}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tableData}
            emptyMessage="Chưa có giao dịch nào"
          />
        </CardContent>
      </Card>
    </div>
  )
}
