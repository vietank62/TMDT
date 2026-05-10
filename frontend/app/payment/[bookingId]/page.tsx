'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PaymentCard from '@/components/payment/PaymentCard'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { getBookingById } from '@/data/bookings'
import { getExpertById } from '@/data/experts'
import { formatCurrency } from '@/lib/utils'

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const booking = getBookingById(bookingId)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const price = booking?.priceVnd ?? 800000
  const expert = booking ? getExpertById(booking.expertId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/consultations"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-semibold text-gray-900">Thanh toán</h1>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-6 space-y-4">
        {/* Order summary */}
        <Card>
          <CardContent className="p-4 text-sm space-y-2">
            <p className="font-semibold text-gray-900">Chi tiết đơn hàng</p>
            <div className="flex justify-between">
              <span className="text-gray-500">Chuyên gia</span>
              <span className="font-medium">{expert?.displayName ?? 'Chuyên gia'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dịch vụ</span>
              <span>Tư vấn {expert?.sessionDurationMinutes ?? 60} phút</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-blue-600">{formatCurrency(price)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment card */}
        <PaymentCard
          amount={price}
          transferCode={`MM${Date.now().toString().slice(-9)}`}
          onSuccess={() => setSuccess(true)}
        />

        {!success && (
          <Button
            variant="ghost"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setCancelOpen(true)}
          >
            Hủy thanh toán
          </Button>
        )}

        {success && (
          <div className="flex gap-3">
            <Button className="flex-1" asChild>
              <Link href="/dashboard/consultations">Xem phiên tư vấn</Link>
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Hủy thanh toán?"
        description="Yêu cầu tư vấn sẽ không được xác nhận. Bạn có thể đặt lại lịch sau."
        confirmLabel="Hủy thanh toán"
        variant="destructive"
        onConfirm={() => { window.location.href = '/dashboard/consultations' }}
      />
    </div>
  )
}
