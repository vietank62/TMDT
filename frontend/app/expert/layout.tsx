import Navbar from '@/components/layout/Navbar'
import ExpertSidebar from '@/components/layout/ExpertSidebar'

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <ExpertSidebar />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
