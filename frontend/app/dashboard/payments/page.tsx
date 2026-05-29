'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Download, Receipt, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable, { Column } from '@/components/common/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import KPIStatCard from '@/components/common/KPIStatCard'
import { Payment, PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

type PaymentRow = Payment & { expertName: string }

const columns: Column<PaymentRow>[] = [
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
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadPayments() {
      try {
        const paymentData = await api.payments.list()
        const experts = await Promise.all(
          Array.from(new Set(paymentData.map((payment) => payment.expertId))).map(async (expertId) => {
            try {
              return [expertId, await api.experts.byId(expertId)] as const
            } catch {
              return [expertId, undefined] as const
            }
          }),
        )
        const expertMap = new Map(experts)
        if (mounted) {
          setPayments(paymentData.map((payment) => ({
            ...payment,
            expertName: expertMap.get(payment.expertId)?.displayName ?? '—',
          })))
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadPayments()
    return () => {
      mounted = false
    }
  }, [])

  const totalPaid = payments.filter((payment) => payment.status === PaymentStatus.PAID).reduce((sum, payment) => sum + payment.amount, 0)
  const totalRefunded = payments.filter((payment) => payment.status === PaymentStatus.REFUNDED).reduce((sum, payment) => sum + payment.amount, 0)
  const totalSessions = payments.filter((payment) => payment.status === PaymentStatus.PAID).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi tất cả giao dịch của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard title="Tổng đã thanh toán" value={formatCurrency(totalPaid)} icon={CreditCard} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Số buổi tư vấn" value={totalSessions} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Đã hoàn tiền" value={formatCurrency(totalRefunded)} icon={Receipt} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={payments} emptyMessage={loading ? 'Đang tải...' : 'Chưa có giao dịch nào'} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
