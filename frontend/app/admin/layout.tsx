import AdminSidebar from '@/components/layout/AdminSidebar'
import AuthGuard from '@/components/auth/AuthGuard'
import AdminHeader from '@/components/layout/AdminHeader'
import { UserRole } from '@/types'

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
