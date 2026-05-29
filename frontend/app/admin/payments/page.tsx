'use client'

import { useEffect, useState } from 'react'
import { CreditCard, DollarSign, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import KPIStatCard from '@/components/common/KPIStatCard'
import { PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AdminPayment, api } from '@/lib/api'

const columns: Column<AdminPayment>[] = [
  { key: 'createdAt', label: 'Ngày', render: (v) => <span className="text-sm">{formatDate(String(v))}</span> },
  { key: 'userName', label: 'Người dùng', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'expertName', label: 'Chuyên gia', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'amount', label: 'Số tiền', render: (v) => <span className="text-sm font-semibold text-blue-600">{formatCurrency(Number(v))}</span> },
  { key: 'transferCode', label: 'Mã GD', render: (v) => <span className="text-xs font-mono">{String(v ?? '—')}</span> },
  { key: 'status', label: 'Trạng thái', render: (v) => <StatusBadge status={v as PaymentStatus} /> },
]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.payments()
      .then((data) => {
        if (mounted) setPayments(data)
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

  const totalPaid = payments.filter((p) => p.status === PaymentStatus.PAID).reduce((sum, payment) => sum + payment.amount, 0)
  const totalPending = payments.filter((p) => p.status === PaymentStatus.PENDING).reduce((sum, payment) => sum + payment.amount, 0)
  const totalRefunded = payments.filter((p) => p.status === PaymentStatus.REFUNDED).reduce((sum, payment) => sum + payment.amount, 0)

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
          {error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={payments} emptyMessage={loading ? 'Đang tải...' : 'Không có thanh toán nào'} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
