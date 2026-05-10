'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import KPIStatCard from '@/components/common/KPIStatCard'
import { mockMonthlyRevenue } from '@/data/payments'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingDown, TrendingUp, Users } from 'lucide-react'

const conversionData = [
  { month: 'Th1', requests: 62, bookings: 52, completed: 48 },
  { month: 'Th2', requests: 75, bookings: 61, completed: 56 },
  { month: 'Th3', requests: 70, bookings: 57, completed: 51 },
  { month: 'Th4', requests: 94, bookings: 78, completed: 72 },
  { month: 'Th5', requests: 102, bookings: 84, completed: 79 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng hợp số liệu hoạt động nền tảng</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard title="Tỷ lệ chấp nhận" value="84%" icon={TrendingUp} trend={3} trendLabel="tháng này" iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Tỷ lệ thanh toán" value="91%" icon={BarChart3} trend={2} trendLabel="tháng này" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Tỷ lệ hoàn tiền" value="4.2%" icon={TrendingDown} trend={-1} trendLabel="tháng này" iconColor="text-red-600" iconBg="bg-red-50" />
        <KPIStatCard title="Người dùng mới" value="127" icon={Users} trend={15} trendLabel="tháng này" iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh thu & Số phiên theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockMonthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <YAxis yAxisId="sessions" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => name === 'revenue' ? [formatCurrency(Number(v)), 'Doanh thu'] : [Number(v), 'Phiên']} />
                <Legend />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="revenue" />
                <Line yAxisId="sessions" type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="sessions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Funnel chuyển đổi</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#e2e8f0" radius={[2, 2, 0, 0]} name="Yêu cầu" />
                <Bar dataKey="bookings" fill="#93c5fd" radius={[2, 2, 0, 0]} name="Đặt lịch" />
                <Bar dataKey="completed" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Hoàn thành" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform health */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sức khỏe nền tảng</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Tỷ lệ hài lòng', value: '98%', color: 'text-green-600' },
              { label: 'Thời gian phản hồi TB', value: '4.2 giờ', color: 'text-blue-600' },
              { label: 'Tỷ lệ giữ chân', value: '72%', color: 'text-purple-600' },
              { label: 'NPS Score', value: '+62', color: 'text-orange-600' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-4">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
