import type { Metadata } from 'next'
import Providers from '@/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'MicroMentor — Nền tảng tư vấn chuyên gia',
  description: 'Kết nối với các chuyên gia hàng đầu cho các buổi tư vấn ngắn, hiệu quả và giá cả hợp lý.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      style={{
        '--font-geist-sans': 'Arial, Helvetica, sans-serif',
        '--font-geist-mono': '"Courier New", monospace',
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
