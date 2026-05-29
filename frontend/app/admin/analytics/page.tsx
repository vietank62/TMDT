'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import KPIStatCard from '@/components/common/KPIStatCard'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp, Users, Wallet } from 'lucide-react'
import { api } from '@/lib/api'

type ChartPoint = Record<string, string | number>

interface AdminDashboard {
  total_users: number
  total_experts: number
  total_bookings: number
  total_revenue: number
  active_bookings: number
  monthly_revenue: ChartPoint[]
}

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.dashboard()
      .then((data) => {
        if (mounted) setDashboard(data as unknown as AdminDashboard)
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message)
      })
    return () => {
      mounted = false
    }
  }, [])

  const monthlyRevenue = dashboard?.monthly_revenue ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
        <p className="text-gray-500 text-sm mt-1">{dashboard ? 'Tổng hợp số liệu hoạt động nền tảng' : error || 'Đang tải...'}</p>
      </div>

      {error && <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard title="Người dùng" value={dashboard?.total_users ?? 0} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <KPIStatCard title="Chuyên gia" value={dashboard?.total_experts ?? 0} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Tổng phiên" value={dashboard?.total_bookings ?? 0} icon={BarChart3} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Doanh thu" value={formatCurrency(dashboard?.total_revenue ?? 0)} icon={Wallet} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh thu & Số phiên theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(0)}M`} />
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
          <CardHeader><CardTitle className="text-base">Phiên theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Phiên" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sức khỏe nền tảng</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-green-600">{dashboard?.active_bookings ?? 0}</p><p className="text-xs text-gray-500 mt-1">Phiên active</p></div>
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-blue-600">{dashboard?.total_bookings ?? 0}</p><p className="text-xs text-gray-500 mt-1">Tổng phiên</p></div>
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-purple-600">{dashboard?.total_experts ?? 0}</p><p className="text-xs text-gray-500 mt-1">Chuyên gia</p></div>
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-orange-600">{formatCurrency(dashboard?.total_revenue ?? 0)}</p><p className="text-xs text-gray-500 mt-1">Doanh thu</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
