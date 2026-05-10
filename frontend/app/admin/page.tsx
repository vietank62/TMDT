'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import KPIStatCard from '@/components/common/KPIStatCard'
import { mockMonthlyRevenue } from '@/data/payments'
import { mockUsers } from '@/data/users'
import { mockExperts } from '@/data/experts'
import { mockBookings } from '@/data/bookings'
import { mockApplications } from '@/data/applications'
import { BookingStatus, ExpertApplicationStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, CreditCard, Users, UserCheck, FileText, TrendingUp } from 'lucide-react'

const bookingStatusData = [
  { name: 'Hoàn thành', value: mockBookings.filter((b) => b.status === BookingStatus.COMPLETED).length, color: '#10b981' },
  { name: 'Đang diễn ra', value: mockBookings.filter((b) => b.status === BookingStatus.IN_PROGRESS).length, color: '#8b5cf6' },
  { name: 'Chờ duyệt', value: mockBookings.filter((b) => b.status === BookingStatus.PENDING_APPROVAL).length, color: '#f59e0b' },
  { name: 'Đã hủy/Từ chối', value: mockBookings.filter((b) => [BookingStatus.REJECTED, BookingStatus.CANCELLED_BY_USER, BookingStatus.CANCELLED_BY_EXPERT].includes(b.status)).length, color: '#ef4444' },
]

const categoryData = [
  { name: 'Công nghệ', value: mockExperts.filter((e) => e.category === 'technology').length },
  { name: 'Marketing', value: mockExperts.filter((e) => e.category === 'marketing').length },
  { name: 'Tài chính', value: mockExperts.filter((e) => e.category === 'finance').length },
  { name: 'Khác', value: mockExperts.filter((e) => !['technology', 'marketing', 'finance'].includes(e.category)).length },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
const pendingApps = mockApplications.filter((a) => a.status === ExpertApplicationStatus.PENDING_REVIEW).length
const totalRevenue = mockMonthlyRevenue.reduce((s, m) => s + m.revenue, 0)

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Dữ liệu tháng 5/2025</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard title="Tổng người dùng" value={mockUsers.length} icon={Users} trend={8} trendLabel="tháng này" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KPIStatCard title="Chuyên gia" value={mockExperts.length} icon={UserCheck} trend={5} trendLabel="tháng này" iconColor="text-green-600" iconBg="bg-green-50" />
        <KPIStatCard title="Doanh thu tháng 5" value={formatCurrency(71000000)} icon={CreditCard} trend={6} trendLabel="so với tháng 4" iconColor="text-purple-600" iconBg="bg-purple-50" />
        <KPIStatCard title="Hồ sơ chờ duyệt" value={pendingApps} icon={FileText} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Doanh thu theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockMonthlyRevenue}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
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
                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {bookingStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Số phiên tư vấn theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockMonthlyRevenue}>
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
          <CardHeader><CardTitle className="text-base">Chuyên gia theo lĩnh vực</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">84%</p><p className="text-xs text-gray-500 mt-1">Tỷ lệ chấp nhận</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">91%</p><p className="text-xs text-gray-500 mt-1">Tỷ lệ thanh toán</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">4.2%</p><p className="text-xs text-gray-500 mt-1">Tỷ lệ hoàn tiền</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">98%</p><p className="text-xs text-gray-500 mt-1">Tỷ lệ hài lòng</p></CardContent></Card>
      </div>
    </div>
  )
}
