'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import KPIStatCard from '@/components/common/KPIStatCard'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, FileText, UserCheck, Users } from 'lucide-react'
import { api } from '@/lib/api'

type ChartPoint = Record<string, string | number>

interface AdminDashboard {
  total_users: number
  total_experts: number
  total_bookings: number
  total_revenue: number
  pending_applications: number
  active_bookings: number
  monthly_revenue: ChartPoint[]
  booking_status_breakdown: ChartPoint[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function AdminOverviewPage() {
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
  const bookingStatusData = dashboard?.booking_status_breakdown ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">{dashboard ? 'Dữ liệu từ backend' : error || 'Đang tải...'}</p>
      </div>

      {error && <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard title="Tổng người dùng" value={dashboard?.total_users ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Chuyên gia" value={dashboard?.total_experts ?? 0} icon={UserCheck} iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Tổng doanh thu" value={formatCurrency(dashboard?.total_revenue ?? 0)} icon={CreditCard} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <KPIStatCard title="Hồ sơ chờ duyệt" value={dashboard?.pending_applications ?? 0} icon={FileText} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh thu theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Doanh thu']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Phiên tư vấn theo trạng thái</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="label" labelLine={false}>
                  {bookingStatusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Số phiên tư vấn theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Phiên" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tình trạng vận hành</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-blue-600">{dashboard?.total_bookings ?? 0}</p><p className="text-xs text-gray-500 mt-1">Tổng phiên</p></div>
            <div className="rounded-xl border p-4"><p className="text-2xl font-bold text-green-600">{dashboard?.active_bookings ?? 0}</p><p className="text-xs text-gray-500 mt-1">Phiên active</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
