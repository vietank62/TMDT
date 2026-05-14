import Navbar from '@/components/layout/Navbar'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import AuthGuard from '@/components/auth/AuthGuard'

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 relative">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
