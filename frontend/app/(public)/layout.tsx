import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">MicroMentor</h3>
              <p className="text-sm text-gray-500">Nền tảng tư vấn chuyên gia hàng đầu Việt Nam</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Khám phá</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/experts" className="hover:text-blue-600">Tìm chuyên gia</Link></li>
                <li><a href="/about" className="hover:text-blue-600">Về chúng tôi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-blue-600">Chính sách hoàn tiền</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-blue-600">Chính sách bảo mật</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-gray-400">
            © 2025 MicroMentor. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  )
}
