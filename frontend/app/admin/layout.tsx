import AdminSidebar from '@/components/layout/AdminSidebar'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 h-14 border-b bg-slate-900 flex items-center px-4 gap-4">
        <Link href="/admin" className="flex items-center gap-2 text-white font-bold">
          <Shield className="h-5 w-5 text-blue-400" />
          MicroMentor Admin
        </Link>
        <div className="flex-1" />
        <div className="text-sm text-slate-400">admin@micromentor.vn</div>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
