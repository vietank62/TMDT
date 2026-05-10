'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import KPIStatCard from '@/components/common/KPIStatCard'
import DataTable, { Column } from '@/components/common/DataTable'
import { mockPayouts, mockMonthlyRevenue } from '@/data/payments'
import { getExpertById } from '@/data/experts'
import { Payout } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, DollarSign, TrendingUp, Wallet } from 'lucide-react'

const expert = getExpertById('expert-1')!

const payoutColumns: Column<Payout>[] = [
  { key: 'requestedAt', label: 'Ngày yêu cầu', render: (v) => <span className="text-sm">{formatDate(String(v))}</span> },
  { key: 'amount', label: 'Số tiền', render: (v) => <span className="text-sm font-semibold">{formatCurrency(Number(v))}</span> },
  { key: 'bankAccount', label: 'Tài khoản ngân hàng', render: (v) => <span className="text-sm">{String(v)}</span> },
  {
    key: 'status', label: 'Trạng thái',
    render: (v) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v === 'PROCESSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {v === 'PROCESSED' ? 'Đã chuyển' : 'Đang xử lý'}
      </span>
    ),
  },
]

const expertPayouts = mockPayouts.filter((p) => p.expertId === 'expert-1')

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Doanh thu</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi thu nhập và lịch sử chi trả</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPIStatCard
          title="Tổng thu nhập"
          value={formatCurrency(expert.totalEarnings)}
          icon={DollarSign}
          trend={18}
          trendLabel="so với tháng trước"
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KPIStatCard
          title="Số dư khả dụng"
          value={formatCurrency(expert.pendingBalance)}
          icon={Wallet}
          description="Có thể rút ngay"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPIStatCard
          title="Tổng phiên tư vấn"
          value={expert.totalSessions}
          icon={TrendingUp}
          trend={12}
          trendLabel="so với tháng trước"
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
            <Button variant="outline" size="sm" disabled>Rút tiền ({formatCurrency(expert.pendingBalance)})</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockMonthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Doanh thu']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payout history */}
      <Card>
        <CardHeader><CardTitle className="text-base">Lịch sử chi trả</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={payoutColumns} data={expertPayouts} emptyMessage="Chưa có lịch sử chi trả" />
        </CardContent>
      </Card>
    </div>
  )
}
