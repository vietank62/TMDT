'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PaymentCard from '@/components/payment/PaymentCard'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Booking, ExpertProfile, Payment, PaymentStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadPayment() {
      try {
        const bookingData = await api.bookings.byId(bookingId)
        const [expertData, paymentData] = await Promise.all([
          api.experts.byId(bookingData.expertId),
          api.payments.createOrder(bookingId),
        ])
        if (mounted) {
          setBooking(bookingData)
          setExpert(expertData)
          setPayment(paymentData)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadPayment()
    return () => {
      mounted = false
    }
  }, [bookingId])

  const price = payment?.amount ?? booking?.priceVnd ?? 0
  const isPaid = payment?.status === PaymentStatus.PAID

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
        {error ? (
          <Card>
            <CardContent className="p-6 text-sm text-red-500">{error}</CardContent>
          </Card>
        ) : loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-400">Đang tải thông tin thanh toán...</CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4 text-sm space-y-2">
                <p className="font-semibold text-gray-900">Chi tiết đơn hàng</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chuyên gia</span>
                  <span className="font-medium">{expert?.displayName ?? 'Chuyên gia'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dịch vụ</span>
                  <span>Tư vấn {booking?.durationMinutes ?? expert?.sessionDurationMinutes ?? 60} phút</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-blue-600">{formatCurrency(price)}</span>
                </div>
              </CardContent>
            </Card>

            <PaymentCard
              amount={price}
              transferCode={payment?.transferCode ?? ''}
              qrCode={payment?.sepayQrCode}
              bankAccount={payment?.bankAccount}
              status={isPaid ? 'success' : 'waiting'}
            />

            {!isPaid && (
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setCancelOpen(true)}
              >
                Hủy thanh toán
              </Button>
            )}

            {isPaid && (
              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <Link href="/dashboard/consultations">Xem phiên tư vấn</Link>
                </Button>
              </div>
            )}
          </>
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
