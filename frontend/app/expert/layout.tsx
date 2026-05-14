import Navbar from '@/components/layout/Navbar'
import ExpertSidebar from '@/components/layout/ExpertSidebar'
import AuthGuard from '@/components/auth/AuthGuard'
import { UserRole } from '@/types'

export default function ExpertLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard requiredRole={UserRole.EXPERT}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 relative">
          <ExpertSidebar />
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
