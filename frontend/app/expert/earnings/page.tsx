'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import KPIStatCard from '@/components/common/KPIStatCard'
import DataTable, { Column } from '@/components/common/DataTable'
import { Payout } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, Wallet } from 'lucide-react'
import { api } from '@/lib/api'

const payoutColumns: Column<Payout>[] = [
  { key: 'requestedAt', label: 'Ngày yêu cầu', render: (v) => <span className="text-sm">{formatDate(String(v))}</span> },
  { key: 'amount', label: 'Số tiền', render: (v) => <span className="text-sm font-semibold">{formatCurrency(Number(v))}</span> },
  { key: 'bankAccount', label: 'Tài khoản ngân hàng', render: (v) => <span className="text-sm">{String(v)}</span> },
  {
    key: 'status', label: 'Trạng thái',
    render: (v) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v === 'PROCESSED' || v === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {v === 'PROCESSED' || v === 'PAID' ? 'Đã chuyển' : 'Đang xử lý'}
      </span>
    ),
  },
]

export default function EarningsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [summary, setSummary] = useState({ totalEarnings: 0, pendingBalance: 0, totalPaidOut: 0, totalSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadEarnings() {
      try {
        const [profile, payoutSummary, payoutData] = await Promise.all([
          api.experts.profile(),
          api.payouts.summary(),
          api.payouts.list(),
        ])
        if (mounted) {
          setPayouts(payoutData)
          setSummary({
            totalEarnings: payoutSummary.total_earnings,
            pendingBalance: payoutSummary.pending_balance,
            totalPaidOut: payoutSummary.total_paid_out,
            totalSessions: profile.totalSessions,
          })
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải doanh thu')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadEarnings()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Doanh thu</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? 'Đang tải...' : 'Theo dõi thu nhập và lịch sử chi trả'}</p>
      </div>

      {error && <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard title="Tổng thu nhập" value={formatCurrency(summary.totalEarnings)} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Số dư khả dụng" value={formatCurrency(summary.pendingBalance)} icon={Wallet} description="Có thể rút ngay" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Tổng phiên tư vấn" value={summary.totalSessions} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Chi trả</CardTitle>
            <Button variant="outline" size="sm" disabled>Rút tiền ({formatCurrency(summary.pendingBalance)})</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Tổng đã chi trả: <span className="font-semibold text-gray-900">{formatCurrency(summary.totalPaidOut)}</span>
          </div>
          <DataTable columns={payoutColumns} data={payouts} emptyMessage={loading ? 'Đang tải...' : 'Chưa có lịch sử chi trả'} />
        </CardContent>
      </Card>
    </div>
  )
}
